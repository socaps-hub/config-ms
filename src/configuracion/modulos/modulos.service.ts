import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { CreateModuloInput } from './dto/create-modulo.input';
import { UpdateModuloInput } from './dto/update-modulo.input';
import { CreateSubModuloInput } from './dto/create-submodulo.input';
import { UpdateSubModuloInput } from './dto/update-submodulo.input';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class ModulosService extends PrismaClient implements OnModuleInit {

  private readonly _logger = new Logger('ModulosService')
  
  async onModuleInit() {
    await this.$connect();
    this._logger.log('Database connected')
  }

  // ============================
  // MÓDULOS
  // ============================

  async findAllModulos() {
    return this.m02Modulo.findMany({
      orderBy: { M02Orden: 'asc' },
      include: {
        submodulos: {
          orderBy: { M03Orden: 'asc' },
        },
      },
    });
  }

  async findModuloById(id: number) {
    const modulo = await this.m02Modulo.findUnique({
      where: { M02Id: id },
      include: { submodulos: true },
    });

    if ( !modulo ) {
        throw new RpcException({
            message: `El módulo ${ id } no existe`,
            status: HttpStatus.BAD_REQUEST
        })
    }

    return modulo
  }

  async createModulo(input: CreateModuloInput) {

    const moduloInDB = await this.m02Modulo.findFirst({
      where: { M02Nombre: input.M02Nombre },      
    });

    if (moduloInDB) {
      throw new RpcException({
        message: `El módulo con nombre ${input.M02Nombre} ya existe`,
        status: HttpStatus.BAD_REQUEST
      });
    }

    return this.m02Modulo.create({
      data: {
        ...input,
      },
    });
  }

  async updateModulo(input: UpdateModuloInput) {
    const { id, ...rest } = input

    const modulo = await this.findModuloById(id)

    return this.m02Modulo.update({
      where: { M02Id: id },
      data: { ...rest },
    });
  }

  async desactivateModulo(id: number) {
    const modulo = await this.findModuloById(id)

    return this.m02Modulo.update({
      where: { M02Id: id },
      data: { M02Activo: false },
    });
  }

  async activateModulo(id: number) {
    await this.findModuloById(id);

    return this.m02Modulo.update({
      where: { M02Id: id },
      data: { M02Activo: true },
    });
  }

  // ============================
  //* SUBMÓDULOS
  // ============================

  async createSubModulo(input: CreateSubModuloInput) {
    const submoduloInDB = await this.m03SubModulo.findFirst({
      where: { M03Nombre: input.M03Nombre }
    });

    if (submoduloInDB) {
      throw new RpcException({
        message: `El submodulo con nombre ${input.M03Nombre} ya existe`,
        status: HttpStatus.BAD_REQUEST
      });
    }

    return this.m03SubModulo.create({
      data: {
        ...input,
      },
    });
  }

  async findSubModuloById( id: number) {
    const submodulo = await this.m03SubModulo.findUnique({
        where: { M03Id: id }
    })

    if ( !submodulo ) {
        throw new RpcException({
            message: `El submodulo ${ id } no existe`,
            status: HttpStatus.BAD_REQUEST
        })
    }

    return submodulo
  }

  async updateSubModulo(input: UpdateSubModuloInput) {

    const { id, ...rest } = input

    const submodulo = await this.findSubModuloById(id)
    
    return this.m03SubModulo.update({
      where: { M03Id: id },
      data: { ...rest },
    });
  }

  async desactivateSubModulo(id: number) {
    const submodulo = await this.findSubModuloById(id)
    
    return this.m03SubModulo.update({
      where: { M03Id: id },
      data: { M03Activo: false },
    });
  }

  async activateSubModulo(id: number) {
    const submodulo = await this.findSubModuloById(id)
    
    return this.m03SubModulo.update({
      where: { M03Id: id },
      data: { M03Activo: true },
    });
  }

}
