import { BadRequestException, HttpStatus, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Categoria } from './entities/categoria.entity';
import { CreateCategoriaInput } from './dto/inputs/create-categoria.input';
import { RpcException } from '@nestjs/microservices';
import { Usuario } from '../../common/entities/usuario.entity';

@Injectable()
export class CategoriasService extends PrismaClient implements OnModuleInit {

  private readonly _logger = new Logger('CategoriasService')
  
  async onModuleInit() {
    await this.$connect();
    this._logger.log('Database connected')
  }

  async create({ R14Nom }: CreateCategoriaInput, user: Usuario): Promise<Categoria> {

    const categoria = await this.r14Categoria.findFirst({
      where: { R14Nom },
      include: {
        cooperativa: true
      }
    })

    if ( categoria ) {
      throw new RpcException({
        message: `Categoria (${ R14Nom }) ya existe`,
        status: HttpStatus.BAD_REQUEST
      })
      // throw new BadRequestException(`Categoria (${ R14Nom }) ya existe`)
    }

    return await this.r14Categoria.create({
      data: {
        R14Nom,
        R14Coop_id: user.R12Coop_id,
        R14Activ: true,
      }
    })
  }

  async findAll(): Promise<Categoria[]> {
    return await this.r14Categoria.findMany({});
  }

  async findOne(id: string): Promise<Categoria> {
    
    const categoria = await this.r14Categoria.findFirst({
      where: { R14Id: id }
    })

    if ( !categoria ) {
      throw new RpcException({
        message: `Categoría con id ${ id } no existe`,
        status: HttpStatus.NOT_FOUND
      })
      // throw new NotFoundException(`Categoría con id ${ id } no existe`)
    }
    return categoria
  }

  // update(id: number, updateCategoriaInput: UpdateCategoriaInput) {
  //   return `This action updates a #${id} categoria`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} categoria`;
  // }
}