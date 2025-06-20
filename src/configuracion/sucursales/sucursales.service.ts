import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { Sucursal } from './entities/sucursal.entity';
import { CreateSucursaleInput } from './dto/inputs/create-sucursale.input';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UpdateSucursalInput } from './dto/inputs/update-sucursale.input';

@Injectable()
export class SucursalesService extends PrismaClient implements OnModuleInit {

  private readonly _logger = new Logger('SucursalesService')

  
  async onModuleInit() {
    await this.$connect();
    this._logger.log('Database connected')
  }

  async create(createSucursaleInput: CreateSucursaleInput, user: Usuario): Promise<Sucursal> {

    const { R11Nom, R11Coop_id, R11NumSuc } = createSucursaleInput

    const [sucursalWithSameName, sucursalWithSameNumSuc] = await Promise.all([
      this.r11Sucursal.findFirst({ where: { R11Nom: R11Nom.trim(), R11Coop_id } }),
      this.r11Sucursal.findFirst({ where: { R11NumSuc, R11Coop_id } }),
    ])

    if (sucursalWithSameName) {    
      throw new RpcException({
        message: `La sucursal ${ R11Nom } ya existe en esa cooperativa`,
        status: HttpStatus.BAD_REQUEST
      })
    }

    if ( sucursalWithSameNumSuc ) {
      throw new RpcException({
        message: `La sucursal con el número ${ R11NumSuc } ya existe en esa cooperativa`,
        status: HttpStatus.BAD_REQUEST
      })
    }

    return await this.r11Sucursal.create({
      data: {
        ...createSucursaleInput
      }
    });
  }

  async findAll( user: Usuario ): Promise<Sucursal[]> {
    const sucursales = await this.r11Sucursal.findMany({
      where: {
        R11Coop_id: user.R12Coop_id,
      }
    })
    

    return sucursales
  }

  async findAllByCoopId( coopId: string ): Promise<Sucursal[]> {

    const sucursales = await this.r11Sucursal.findMany({
      where: {
        R11Coop_id: coopId,
      }
    })
    

    return sucursales

  }

  async findOne(id: string, user: Usuario): Promise<Sucursal> {
    const sucursal = await this.r11Sucursal.findFirst({
      where: { R11Id: id, R11Coop_id: user.R12Coop_id }
    })

    if ( !sucursal ) {
      throw new RpcException({
        message: `Sucursal con el id ${ id } no existe`,
        status: HttpStatus.BAD_REQUEST
      })
      // throw new BadRequestException(`Sucursal con el id ${ id } no existe`)
    }

    return sucursal
  }

  async update(id: string, updateSucursalInput: UpdateSucursalInput ): Promise<Sucursal> {

    const { R11Nom, R11NumSuc, R11Coop_id } = updateSucursalInput;
    
    // Verificar existencia
    const existing = await this.r11Sucursal.findFirst({
      where: { R11Id: id, R11Coop_id },
    });
    
    if (!existing) {
      throw new RpcException({
        message: `Sucursal con id ${id} no encontrada`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    if ( R11Nom ) {
      const sucursal = await this.r11Sucursal.findFirst({
        where: { R11Nom: R11Nom.trim(), R11Coop_id }
      })

      if ( sucursal && sucursal.R11Id !== id ) {
        throw new RpcException({
          message: `La sucursal ${ R11Nom } ya existe en la cooperativa`,
          status: HttpStatus.BAD_REQUEST
        })
      }
    }

    return await this.r11Sucursal.update({
      where: { R11Id: id },
      data: {
        R11Nom: R11Nom ?? existing.R11Nom,
        R11NumSuc: R11NumSuc ?? existing.R11NumSuc,
      },
    });
  }

  // async remove(id: string): Promise<Sucursal> {
  //   // Verificar existencia
  //   const existing = await this.r11Sucursal.findFirst({
  //     where: { R11Id: id },
  //   });

  //   if (!existing) {
  //     throw new RpcException({
  //       message: `Sucursal con id ${id} no encontrada`,
  //       status: HttpStatus.NOT_FOUND,
  //     });
  //   }

  //   return await this.r11Sucursal.delete({
  //     where: { R11Id: id },
  //   });
  // }
}