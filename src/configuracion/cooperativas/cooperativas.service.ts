import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Cooperativa } from './entities/cooperativa.entity';
import { RpcException } from '@nestjs/microservices';
import { CreateCooperativaInput } from './dto/inputs/create-cooperativa.input';
import { UpdateCooperativaInput } from './dto/inputs/update-cooperativa.input';

@Injectable()
export class CooperativasService extends PrismaClient implements OnModuleInit {

  private readonly _logger = new Logger('CooperativasService')

  async onModuleInit() {
    await this.$connect();
    this._logger.log('Database connected')
  }

  async create(createCooperativaInput: CreateCooperativaInput): Promise<Cooperativa> {
    const { R17Nom, R17Logo } = createCooperativaInput

    const cooperativa = await this.r17Cooperativas.findFirst({
      where: { R17Nom: R17Nom }
    })

    console.log(R17Nom, R17Logo);
    

    if ( cooperativa ) {
      throw new RpcException({
        message: `La cooperativa ${ R17Nom } ya existe en la base de datos`,
        status: HttpStatus.BAD_REQUEST
      })
    }

    return await this.r17Cooperativas.create({
      data: {
        R17Nom,
        R17Logo
      },
      include: {
        sucursales: {
          select: { R11Id: true, R11NumSuc: true, R11Nom: true }
        }
      }
    })
  }

  async findAll(): Promise<Cooperativa[]> {
    return await this.r17Cooperativas.findMany({
      where: {
        R17Activ: true
      },
      orderBy: {
        R17Creada_en: 'desc'
      },
      include: {
        sucursales: true
      }
    });
  }

  async findOne(id: string, active: boolean = false ): Promise<Cooperativa> {
    const cooperativa = await this.r17Cooperativas.findFirst({
      where: { R17Id: id, R17Activ: active },
      include: {
        sucursales: true
      }
    })

    if ( !cooperativa ) {
      throw new RpcException({
        message: `Cooperativa con el id ${ id } no existe`,
        status: HttpStatus.BAD_REQUEST
      })
      // throw new BadRequestException(`Cooperativa con el id ${ id } no existe`)
    }

    return cooperativa
  }

  async update(id: string, updateCooperativaInput: UpdateCooperativaInput): Promise<Cooperativa> {

    const { id: _, ...data } = updateCooperativaInput

    const cooperativaDB = await this.findOne( id, true )

    if ( data.R17Nom ) {
      const cooperativa = await this.r17Cooperativas.findFirst({
        where: { R17Nom: data.R17Nom }
      })

      if ( cooperativa && cooperativa.R17Id !== id ) {
        throw new RpcException({
          message: `La cooperativa ${ data.R17Nom } ya existe en la base de datos`,
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
      include: {
        sucursales: {
          select: { R11Id: true, R11NumSuc: true, R11Nom: true }
        }
      }
    });
  }

  async activate( id: string ): Promise<Cooperativa> {
    const cooperativa = await this.findOne( id )
    
    return await this.r17Cooperativas.update({
      where: { R17Id: id },
      data: {
        R17Id: cooperativa.R17Id,
        R17Nom: cooperativa.R17Nom,
        R17Activ: true,
        R17Logo: cooperativa.R17Logo,
      },
      include: {
        sucursales: {
          select: { R11Id: true, R11NumSuc: true, R11Nom: true }
        }
      }
    });
  }

  async desactivate( id: string ): Promise<Cooperativa> {
    const cooperativa = await this.findOne( id, true )
    
    return await this.r17Cooperativas.update({
      where: { R17Id: id },
      data: {
        R17Id: cooperativa.R17Id,
        R17Nom: cooperativa.R17Nom,
        R17Activ: false,
        R17Logo: cooperativa.R17Logo,
      },
      include: {
        sucursales: {
          select: { R11Id: true, R11NumSuc: true, R11Nom: true }
        }
      }
    });
  }
}