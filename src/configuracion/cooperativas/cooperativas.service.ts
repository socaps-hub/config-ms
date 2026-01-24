import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Cooperativa } from './entities/cooperativa.entity';
import { RpcException } from '@nestjs/microservices';
import { CreateCooperativaInput } from './dto/inputs/create-cooperativa.input';
import { UpdateCooperativaInput } from './dto/inputs/update-cooperativa.input';
import { ValidRoles } from 'src/common/enums/valid-roles.enum';
import { CooperativaRadiografiaStatus } from './dto/outputs/cooperativa-radiografia-status.output';
import { AssignCooperativaModuloInput } from './dto/inputs/assign-cooperativa-modulo.input';
import { CooperativaModulo } from './entities/cooperativa-modulo.entity';
import { UpdateCooperativaModuloInput } from './dto/inputs/update-cooperativa-modulo.input';
import { AssignCooperativaSubModuloInput } from './dto/inputs/assign-cooperativa-submodulo.input';
import { CooperativaSubModulo } from './entities/cooperativa-submodulo.entity';
import { UpdateCooperativaSubModuloInput } from './dto/inputs/update-cooperativa-submodulo.input';

@Injectable()
export class CooperativasService extends PrismaClient implements OnModuleInit {

  private readonly _logger = new Logger('CooperativasService')

  async onModuleInit() {
    await this.$connect();
    this._logger.log('Database connected')
  }

  async create(createCooperativaInput: CreateCooperativaInput) {
    const { R17Nom, R17Logo } = createCooperativaInput

    const cooperativa = await this.r17Cooperativas.findFirst({
      where: { R17Nom: R17Nom.trim() }
    })

    if (cooperativa) {

      if (!cooperativa.R17Activ) {
        throw new RpcException({
          message: `Cooperativa (${cooperativa.R17Nom}) esta desactivada`,
          status: HttpStatus.BAD_REQUEST
        })
      }

      throw new RpcException({
        message: `La cooperativa ${R17Nom} ya existe en la base de datos`,
        status: HttpStatus.BAD_REQUEST
      })
    }

    const coop = await this.r17Cooperativas.create({
      data: {
        R17Nom,
        R17Logo
      },  
    })

    return coop
  }

  async findAll(role?: ValidRoles) {
    if (role) {
      return await this._findAllWithRole(role)
    }

    return await this.r17Cooperativas.findMany({
      where: {
        R17Activ: true,
        R17Nom: { not: 'EnfoqueCooperativo' }
      },
      orderBy: {
        R17Creada_en: 'desc'
      },
      include: {
        sucursales: true,
        usuarios: {
          where: {
            R12Activ: true,
          },
          orderBy: {
            R12Creado_en: 'desc'
          },
          select: {
            R12Id: true,
            R12Ni: true,
            R12Nom: true,
            R12Suc_id: true,
            R12Rol: true,
            R12Activ: true,
            sucursal: true,
          }
        },
        productos: {
          where: {
            R13Activ: true,
          },
          orderBy: {
            R13Creado_en: 'desc'
          },
          select: {
            R13Id: true,
            R13Nom: true,
            R13Cat_id: true,
            R13Activ: true,
            R13Coop_id: true,
            categoria: true,
          }
        },
        grupos: {
          orderBy: {
            R02Creado_en: 'desc'
          },
          include: {
            rubros: true
          }
        },
      }
    });
  }

  async findAllWithEjecutivos() {
    const cooperativas = await this.r17Cooperativas.findMany({
      where: {
        R17Activ: true,
        R17Nom: { not: 'EnfoqueCooperativo' }
      },
      orderBy: {
        R17Creada_en: 'desc'
      },
      include: {
        sucursales: true,
        usuarios: {
          where: {
            R12Activ: true,
          },
          orderBy: {
            R12Creado_en: 'desc'
          },
          select: {
            R12Id: true,
            R12Ni: true,
            R12Nom: true,
            R12Suc_id: true,
            R12Rol: true,
            R12Activ: true,
            sucursal: true,
          }
        },
        productos: {
          where: {
            R13Activ: true,
          },
          orderBy: {
            R13Creado_en: 'desc'
          },
          select: {
            R13Id: true,
            R13Nom: true,
            R13Cat_id: true,
            R13Activ: true,
            R13Coop_id: true,
            categoria: true,
          }
        },
        grupos: {
          orderBy: {
            R02Creado_en: 'desc'
          }
        }
      }
    })

    return cooperativas
  }

  async findOne(id: string, active: boolean = false) {
    const cooperativa = await this.r17Cooperativas.findFirst({
      where: { R17Id: id, R17Activ: active },
      include: {
        sucursales: true,
        usuarios: {
          where: {
            R12Activ: true,
          },
          orderBy: {
            R12Creado_en: 'desc'
          },
          select: {
            R12Id: true,
            R12Ni: true,
            R12Nom: true,
            R12Suc_id: true,
            R12Rol: true,
            R12Activ: true,
            sucursal: true,
          }
        },
        productos: {
          where: {
            R13Activ: true,
          },
          orderBy: {
            R13Creado_en: 'desc'
          },
          select: {
            R13Id: true,
            R13Nom: true,
            R13Cat_id: true,
            R13Activ: true,
            R13Coop_id: true,
            categoria: true,
          }
        },
        grupos: {
          orderBy: {
            R02Creado_en: 'desc'
          }
        }
      }
    })

    if (!cooperativa) {
      throw new RpcException({
        message: `Cooperativa con el id ${id} no existe`,
        status: HttpStatus.BAD_REQUEST
      })
      // throw new BadRequestException(`Cooperativa con el id ${ id } no existe`)
    }

    return cooperativa
  }

  async update(id: string, updateCooperativaInput: UpdateCooperativaInput) {

    const { id: _, ...data } = updateCooperativaInput

    const cooperativaDB = await this.findOne(id, true)

    if (data.R17Nom) {
      const cooperativa = await this.r17Cooperativas.findFirst({
        where: { R17Nom: data.R17Nom }
      })

      if (cooperativa && cooperativa.R17Id !== id) {
        throw new RpcException({
          message: `La cooperativa ${data.R17Nom} ya existe en la base de datos`,
          status: HttpStatus.BAD_REQUEST
        })
      }
    }

    return await this.r17Cooperativas.update({
      where: { R17Id: id },
      data: {
        R17Id: cooperativaDB.R17Id,
        ...data,
      },
    });
  }

  async activate(name: string) {
    const cooperativa = await this.r17Cooperativas.findFirst({
      where: { R17Nom: name }
    })

    if (!cooperativa) {
      throw new RpcException({
        message: `Cooperativa ${name} no existe`,
        status: HttpStatus.BAD_REQUEST
      })
      // throw new BadRequestException(`Cooperativa con el id ${ id } no existe`)
    }

    return await this.r17Cooperativas.update({
      where: { R17Id: cooperativa.R17Id },
      data: {
        R17Id: cooperativa.R17Id,
        R17Nom: cooperativa.R17Nom,
        R17Activ: true,
        R17Logo: cooperativa.R17Logo,
      },
    });
  }

  async desactivate(id: string) {
    await this.findOne(id, true)

    return await this.r17Cooperativas.delete({
      where: { R17Id: id }
    })

  }

  private async _findAllWithRole(role: ValidRoles) {
    return await this.r17Cooperativas.findMany({
      where: {
        R17Activ: true,
        R17Nom: { not: 'EnfoqueCooperativo' }
      },
      orderBy: {
        R17Creada_en: 'desc'
      },
      include: {
        sucursales: true,
        usuarios: {
          where: {
            R12Activ: true,
            R12Rol: role,
          },
          orderBy: {
            R12Creado_en: 'desc'
          },
          select: {
            R12Id: true,
            R12Ni: true,
            R12Nom: true,
            R12Suc_id: true,
            R12Rol: true,
            R12Activ: true,
            sucursal: true,
          }
        },
        productos: {
          where: {
            R13Activ: true,
          },
          orderBy: {
            R13Creado_en: 'desc'
          },
          select: {
            R13Id: true,
            R13Nom: true,
            R13Cat_id: true,
            R13Activ: true,
            R13Coop_id: true,
            categoria: true,
          }
        },
        grupos: {
          orderBy: {
            R02Creado_en: 'desc'
          }
        }
      }
    });
  }

  async getCooperativasRadiografiaCreditoStatus(): Promise<CooperativaRadiografiaStatus[]> {
    const cooperativas = await this.r17Cooperativas.findMany({
      select: {
        R17Id: true,
        R17Nom: true,
      },
    });

    // Obtener todas las cargas activas agrupadas por cooperativa
    const cargas = await this.c01ControlCarga.findMany({
      select: { C01CooperativaCodigo: true },
      distinct: ['C01CooperativaCodigo'],
    });

    const cooperativasConCarga = new Set(cargas.map(c => c.C01CooperativaCodigo));

    // Armar respuesta fusionando ambos resultados
    return cooperativas.map(c => ({
      id: c.R17Id,
      nombre: c.R17Nom,
      tieneCarga: cooperativasConCarga.has(c.R17Id), // usa id si lo guardas así
    }));
  }

  // ===============================
  // LICENCIAMIENTO
  // ===============================
  async assignModuloToCooperativa(input: AssignCooperativaModuloInput): Promise<CooperativaModulo> {
    const {
      C02CoopId,
      C02ModuloId,
      C02FechaInicio,
      C02FechaFin
    } = input;

    await this._findCooperativaOrFail(C02CoopId);
    await this._findModuloOrFail(C02ModuloId);

    const existente = await this.c02CooperativaModulo.findUnique({
      where: {
        C02CoopId_C02ModuloId: {
          C02CoopId,
          C02ModuloId
        }
      }
    });

    if (existente) {
      if (existente.C02Activo) {
        throw new RpcException({
          message: 'El módulo ya está asignado a la cooperativa',
          status: HttpStatus.BAD_REQUEST
        });
      }

      // Reactivar
      return this.c02CooperativaModulo.update({
        where: { C02Id: existente.C02Id },
        data: {
          C02Activo: true,
          C02FechaInicio: C02FechaInicio ?? new Date(),
          C02FechaFin: C02FechaFin ?? null
        }
      });
    }

    return this.c02CooperativaModulo.create({
      data: {
        C02CoopId,
        C02ModuloId,
        C02FechaInicio: C02FechaInicio ?? new Date(),
        C02FechaFin: C02FechaFin ?? null
      }
    });
  }

  async updateCooperativaModulo(input: UpdateCooperativaModuloInput): Promise<CooperativaModulo> {
    const { C02Id, ...data } = input;

    await this._findCoopModuloOrFail(C02Id);

    return this.c02CooperativaModulo.update({
      where: { C02Id },
      data
    });
  }

  async getModulosByCooperativa(coopId: string): Promise<CooperativaModulo[]> {
    await this._findCooperativaOrFail(coopId);

    return this.c02CooperativaModulo.findMany({
      where: {
        C02CoopId: coopId,
      },
      orderBy: {
        createdAt: 'asc'
      },
      include: {
        modulo: {
          include: {
            submodulos: {
              orderBy: { M03Orden: 'asc' }
            }
          }
        },
        submodulos: {
          include: {
            subModulo: true
          }
        }
      }
    });
  }

  async assignSubModuloToCooperativa(input: AssignCooperativaSubModuloInput): Promise<CooperativaSubModulo> {
    const { C03CoopModuloId, C03SubModuloId } = input;

    await this._findCoopModuloOrFail(C03CoopModuloId);

    const existente = await this.c03CooperativaSubModulo.findUnique({
      where: {
        C03CoopModuloId_C03SubModuloId: {
          C03CoopModuloId,
          C03SubModuloId
        }
      }
    });

    if (existente) {
      if (existente.C03Activo) {
        throw new RpcException({
          message: 'El submódulo ya está asignado',
          status: HttpStatus.BAD_REQUEST
        });
      }

      return this.c03CooperativaSubModulo.update({
        where: { C03Id: existente.C03Id },
        data: { C03Activo: true }
      });
    }

    return this.c03CooperativaSubModulo.create({
      data: {
        C03CoopModuloId,
        C03SubModuloId
      }
    });
  }

  async updateCooperativaSubModulo(input: UpdateCooperativaSubModuloInput): Promise<CooperativaSubModulo> {
    const { C03Id, ...data } = input;

    const sub = await this.c03CooperativaSubModulo.findUnique({
      where: { C03Id }
    });

    if (!sub) {
      throw new RpcException({
        message: 'Submódulo asignado no existe',
        status: HttpStatus.BAD_REQUEST
      });
    }

    return this.c03CooperativaSubModulo.update({
      where: { C03Id },
      data
    });
  }

  // ===============================
  // HELPERS PRIVADOS
  // ===============================

  private async _findCooperativaOrFail(coopId: string) {
    const coop = await this.r17Cooperativas.findUnique({
      where: { R17Id: coopId }
    });

    if (!coop) {
      throw new RpcException({
        message: `Cooperativa con id ${coopId} no existe`,
        status: HttpStatus.BAD_REQUEST
      });
    }

    return coop;
  }

  private async _findModuloOrFail(moduloId: number) {
    const modulo = await this.m02Modulo.findUnique({
      where: { M02Id: moduloId }
    });

    if (!modulo) {
      throw new RpcException({
        message: `Módulo con id ${moduloId} no existe`,
        status: HttpStatus.BAD_REQUEST
      });
    }

    return modulo;
  }

  private async _findCoopModuloOrFail(id: number) {
    const reg = await this.c02CooperativaModulo.findUnique({
      where: { C02Id: id }
    });

    if (!reg) {
      throw new RpcException({
        message: `Relación Cooperativa–Módulo no existe`,
        status: HttpStatus.BAD_REQUEST
      });
    }

    return reg;
  }

}