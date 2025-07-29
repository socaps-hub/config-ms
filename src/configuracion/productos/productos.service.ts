import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { firstValueFrom } from 'rxjs';

import { Producto } from './entities/producto.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CreateProductoInput } from './dto/inputs/create-producto.input';
import { UpdateProductoInput } from './dto/inputs/update-producto.input';
import { NATS_SERVICE } from 'src/config';
import { CreateProductoImportDto } from './dto/inputs/create-producto-import.dto';
import { BooleanResponse } from 'src/common/dto/boolean-response.object';

@Injectable()
export class ProductosService  extends PrismaClient implements OnModuleInit {

  private readonly _logger = new Logger('ProductosService')
  
  async onModuleInit() {
    await this.$connect();
    this._logger.log('Database connected')
  }

  constructor(
    @Inject(NATS_SERVICE) private readonly _client: ClientProxy,
  ) { 
    super()
  }
  
  async create( createProductoInput: CreateProductoInput ): Promise<Producto> {
    
    const { R13Nom, R13Cat_id, R13Coop_id } = createProductoInput

    // await this._categoriasService.findOne( R13Cat_id )
    const categoria = await firstValueFrom(
      this._client.send('config.categorias.getById', { id: R13Cat_id })
    ).catch( err => {
      throw new RpcException(err)
    })
    

    const product = await this.findByName( R13Coop_id, R13Nom )

    if ( product ) {
      
      if ( !product.R13Activ ) {
        throw new RpcException({
          message: `El producto ${ R13Nom } esta desactivado`,
          status: HttpStatus.BAD_REQUEST
        })
        // throw new BadRequestException(`El producto ${ R13Nom } esta desactivado`)
      }

      throw new RpcException({
        message: `El producto ${ R13Nom } ya existe en tu cooperativa`,
        status: HttpStatus.BAD_REQUEST
      })
      // throw new BadRequestException(`El producto ${ R13Nom } ya existe en tu cooperativa`)
    }

    return await this.r13Producto.create({
      data: {
        ...createProductoInput,
        R13Nom: R13Nom.toLowerCase(),
        R13Activ: true,
        R13Coop_id,
      },
      include: {
        categoria: true
      }
    })    
  }

  async findAll(user: Usuario, categoriaId?: string): Promise<Producto[]> {

    if ( categoriaId ) {
      return await this.findByCategoria( categoriaId, user )
    }

    return await this.r13Producto.findMany({
      orderBy: {
        R13Creado_en: 'desc'
      },
      where: {
        R13Coop_id: user.R12Coop_id,
        R13Activ: true,
      },
      include: {
        categoria: true
      }
    });
  }

  async findByCategoria( categoriaId: string, user: Usuario ): Promise<Producto[]> {
    return await this.r13Producto.findMany({
      orderBy: {
        R13Creado_en: 'desc'
      },
      where: {
        R13Coop_id: user.R12Coop_id,
        R13Cat_id: categoriaId,
        R13Activ: true
      },
      include: {
        categoria: true
      }
    })
  }

  async findByID(id: string) {
    const producto = await this.r13Producto.findFirst({
      where: { R13Id: id },
      include: {
        categoria: {
          select: {
            R14Id: true,
            R14Nom: true,
            R14Activ: true
          }
        }
      }
    })

    if ( !producto || !producto.R13Activ ) {
      throw new RpcException({
        message: `El producto con id ${ id } no existe`,
        status: HttpStatus.NOT_FOUND
      })
      // throw new BadRequestException(`El producto con id ${ id } no existe`)
    }

    return producto
  }

  async findByName( R13Coop_id: string , name?: string) {
    return await this.r13Producto.findFirst({
      where: {
        R13Coop_id,
        R13Nom: name?.toLowerCase().trim()
      }
    })
  }

  async update(id: string, updateProductoInput: UpdateProductoInput) {

    const { R13Cat_id, R13Nom, R13Coop_id } = updateProductoInput

    if (!R13Coop_id) {
      throw new RpcException({
        message: `Es necesario R13Coop_id para actualizar el producto`,
        status: HttpStatus.BAD_REQUEST
      })
    }
    
    if ( R13Nom ) {
      const product = await this.findByName( R13Coop_id, R13Nom )
      
      if (product && product.R13Id !== id) {
        throw new RpcException({
          message: `El producto ${ R13Nom } ya existe en tu cooperativa`,
          status: HttpStatus.BAD_REQUEST
        })
        // throw new BadRequestException(`El producto ${ R13Nom } ya existe en tu cooperativa`)
      }
    }
    
    const productDB = await this.findByID( id )
    return this.r13Producto.update({
      where: { R13Id: id },
      data: {
        R13Id: productDB.R13Id,
        R13Cat_id: R13Cat_id ? R13Cat_id : productDB.R13Cat_id,
        R13Nom: R13Nom ? R13Nom : productDB.R13Nom,
        R13Activ: productDB.R13Activ,
        R13Coop_id: productDB.R13Coop_id,
      },
      include: {
        categoria: {
          select: {
            R14Id: true,
            R14Nom: true,
            R14Activ: true
          }
        }
      }
    })
  }

  async activate( name: string, coopId: string ) {
    console.log(name, coopId);
    
    const producto = await this.r13Producto.findFirst({
      where: { R13Nom: name.toLowerCase().trim(), R13Coop_id: coopId },
      include: {
        categoria: {
          select: {
            R14Id: true,
            R14Nom: true,
            R14Activ: true
          }
        }
      }
    })

    if ( !producto ) {
      throw new RpcException({
        message: `El producto ${ name } no existe`,
        status: HttpStatus.BAD_REQUEST
      })
      // throw new BadRequestException(`El producto ${ name } no existe`)
    }
    producto.R13Activ = true

    return await this.r13Producto.update({
      where: { R13Id: producto.R13Id },
      data: {
        R13Id: producto.R13Id,
        R13Nom: producto.R13Nom,
        R13Cat_id: producto.R13Cat_id,
        R13Activ: producto.R13Activ,
        R13Coop_id: producto.R13Coop_id,
      },
      include: {
        categoria: {
          select: {
            R14Id: true,
            R14Nom: true,
            R14Activ: true
          }
        }
      }
    })
  }

  async desactivate(id: string) {
    const producto = await this.findByID( id )
    producto.R13Activ = false

    return await this.r13Producto.update({
      where: { R13Id: id },
      data: {
        R13Id: producto.R13Id,
        R13Nom: producto.R13Nom,
        R13Cat_id: producto.R13Cat_id,
        R13Activ: producto.R13Activ,
        R13Coop_id: producto.R13Coop_id,
      },
      include: {
        categoria: {
          select: {
            R14Id: true,
            R14Nom: true,
            R14Activ: true
          }
        }
      }
    })
  }

  async createManyFromExcel(data: CreateProductoImportDto[], coopId: string): Promise<BooleanResponse> {
    const productosToCreate: any[] = [];

    try {

      for (const item of data) {
        const nombre = item.Nombre?.trim().toLowerCase();

        if (!nombre) continue; // salta vacíos

        // Verifica si el producto ya existe en esta cooperativa
        const productoExistente = await this.r13Producto.findFirst({
          where: {
            R13Coop_id: coopId,
            R13Nom: nombre,
          },
        });

        if (productoExistente) continue;

        // Busca la categoría por nombre
        const categoria = await this.r14Categoria.findFirst({
          where: {
            // R14Coop_id: coopId,
            R14Nom: {
              contains: item.Categoria,
              mode: 'insensitive',
            },
          },
        });

        if (!categoria) {
          throw new RpcException({
            message: `Categoría no encontrada: ${item.Categoria}`,
            status: HttpStatus.BAD_REQUEST
          });
        }

        productosToCreate.push({
          R13Nom: nombre,
          R13Cat_id: categoria.R14Id,
          R13Coop_id: coopId,
          R13Activ: true,
        });
      }

      if (!productosToCreate.length) {
        return {
          success: false,
          message: 'No se encontraron productos nuevos para agregar. Tal vez esten repetidos o esten desactivados.',
        };
      }

      const result = await this.r13Producto.createMany({
        data: productosToCreate,
        skipDuplicates: true,
      });

      return {
        success: true,
        message: `${result.count} productos creados exitosamente.`,
      };
      
    } catch (err) {
      console.log(err);
      return { success: false, message: 'Error en la importación de productos' }
    }

  }

}