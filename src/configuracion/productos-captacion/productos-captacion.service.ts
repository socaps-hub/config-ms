import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import { Prisma, PrismaClient } from '@prisma/client';

import { BooleanResponse } from 'src/common/dto/boolean-response.object';
import { CreateProductoCaptacionInput } from './dto/inputs/create-producto-captacion.input';
import { UpdateProductoCaptacionInput } from './dto/inputs/update-producto-captacion.input';
import { CreateProductoCaptacionImportDto } from './dto/inputs/create-producto-captacion-import.dto';
import { ProductoCaptacion } from './entities/producto-captacion.entity';

@Injectable()
export class ProductosCaptacionService extends PrismaClient implements OnModuleInit {
  private readonly _logger = new Logger(ProductosCaptacionService.name);

  public async onModuleInit(): Promise<void> {
    await this.$connect();

    this._logger.log('Database connected');
  }

  // ============================================================
  // CREATE
  // ============================================================

  public async create(
    input: CreateProductoCaptacionInput,
  ): Promise<ProductoCaptacion> {
    const nombre = this._normalizeName(input.R27Nom);

    await this._validateCategoria(input.R27Cat_id);

    const productoExistente = await this.findByName(input.R27Coop_id, nombre);

    if (productoExistente) {
      if (!productoExistente.R27Activ) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: `El producto ${input.R27Nom.trim()} ya existe, pero está desactivado`,
        });
      }

      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `El producto ${input.R27Nom.trim()} ya existe en tu cooperativa`,
      });
    }

    try {
      return await this.r27ProductoCaptacion.create({
        data: {
          R27Nom: nombre,
          R27Cat_id: input.R27Cat_id,
          R27Coop_id: input.R27Coop_id,
          R27Activ: true,
        },
        include: {
          categoria: true,
        },
      });
    } catch (error) {
      this._handlePrismaError(
        error,
        'No fue posible crear el producto de captación',
      );
    }
  }

  // ============================================================
  // FIND ALL
  // ============================================================

  public async findAll(
    coopId: string,
    categoriaId?: string,
  ): Promise<ProductoCaptacion[]> {
    return this.r27ProductoCaptacion.findMany({
      where: {
        R27Coop_id: coopId,
        R27Activ: true,

        ...(categoriaId
          ? {
              R27Cat_id: categoriaId,
            }
          : {}),
      },

      include: {
        categoria: true,
      },

      orderBy: {
        R27Nom: 'asc',
      },
    });
  }

  // ============================================================
  // FIND BY CATEGORY
  // ============================================================

  public async findByCategoria(
    categoriaId: string,
    coopId: string,
  ): Promise<ProductoCaptacion[]> {
    return this.findAll(coopId, categoriaId);
  }

  // ============================================================
  // FIND BY ID
  // ============================================================

  public async findByID(
    id: string,
    coopId: string,
  ): Promise<ProductoCaptacion> {
    const producto = await this.r27ProductoCaptacion.findFirst({
      where: {
        R27Id: id,
        R27Coop_id: coopId,
        R27Activ: true,
      },

      include: {
        categoria: true,
      },
    });

    if (!producto) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `El producto de captación con id ${id} no existe, o esta desactivado`,
      });
    }

    return producto;
  }

  // ============================================================
  // FIND BY NAME
  // ============================================================

  public async findByName(coopId: string, name: string) {
    const nombre = this._normalizeName(name);

    return this.r27ProductoCaptacion.findUnique({
      where: {
        R27Coop_id_R27Nom: {
          R27Coop_id: coopId,
          R27Nom: nombre,
        },
      },
    });
  }

  // ============================================================
  // UPDATE
  // ============================================================

  public async update(
    id: string,
    coopId: string,
    input: UpdateProductoCaptacionInput,
  ): Promise<ProductoCaptacion> {
    const producto = await this.findByID(id, coopId);

    const data: Prisma.R27ProductoCaptacionUpdateInput = {};

    if (input.R27Nom !== undefined) {
      const nombre = this._normalizeName(input.R27Nom);

      const productoExistente = await this.findByName(coopId, nombre);

      if (productoExistente && productoExistente.R27Id !== id) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: `El producto ${input.R27Nom.trim()} ya existe en tu cooperativa`,
        });
      }

      if (nombre !== producto.R27Nom) {
        data.R27Nom = nombre;
      }
    }

    if (
      input.R27Cat_id !== undefined &&
      input.R27Cat_id !== producto.R27Cat_id
    ) {
      await this._validateCategoria(input.R27Cat_id);

      data.categoria = {
        connect: {
          R26Id: input.R27Cat_id,
        },
      };
    }

    if (Object.keys(data).length === 0) {
      return producto;
    }

    try {
      return await this.r27ProductoCaptacion.update({
        where: {
          R27Id: id,
        },

        data,

        include: {
          categoria: true,
        },
      });
    } catch (error) {
      this._handlePrismaError(
        error,
        'No fue posible actualizar el producto de captación',
      );
    }
  }

  // ============================================================
  // ACTIVATE
  // ============================================================

  public async activate(
    name: string,
    coopId: string,
  ): Promise<ProductoCaptacion> {
    const nombre = this._normalizeName(name);

    const producto = await this.findByName(coopId, nombre);

    if (!producto) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `El producto ${name.trim()} no existe`,
      });
    }

    if (producto.R27Activ) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `El producto ${name.trim()} ya está activo`,
      });
    }

    return this.r27ProductoCaptacion.update({
      where: {
        R27Id: producto.R27Id,
      },

      data: {
        R27Activ: true,
      },

      include: {
        categoria: true,
      },
    });
  }

  // ============================================================
  // DESACTIVATE
  // ============================================================

  public async desactivate(
    id: string,
    coopId: string,
  ): Promise<ProductoCaptacion> {
    const producto = await this.findByID(id, coopId);

    return this.r27ProductoCaptacion.update({
      where: {
        R27Id: producto.R27Id,
      },

      data: {
        R27Activ: false,
      },

      include: {
        categoria: true,
      },
    });
  }

  // ============================================================
  // CREATE MANY FROM EXCEL
  // ============================================================

  public async createManyFromExcel(
    data: CreateProductoCaptacionImportDto[],
    coopId: string,
  ): Promise<BooleanResponse> {
    if (!data.length) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'El archivo no contiene productos para importar',
      });
    }

    /*
     * 1. Normalizamos primero todo el archivo.
     *
     * El Map elimina productos repetidos dentro del propio
     * Excel antes de tocar la base de datos.
     *
     * La clave es solamente el nombre porque la regla de
     * negocio indica que no puede repetirse dentro de una
     * cooperativa aunque pertenezca a otra categoría.
     */
    const productosArchivo = new Map<
      string,
      {
        nombre: string;
        categoria: string;
      }
    >();

    const productosDuplicados = new Set<string>();

    const filasInvalidas: number[] = [];

    for (const [index, item] of data.entries()) {
      const nombre = this._normalizeName(item.Nombre);

      const categoria = this._normalizeName(item.Categoria);

      if (!nombre || !categoria) {
        /*
         * +2:
         * index comienza en 0 y asumimos que la fila 1
         * corresponde a los encabezados del Excel.
         */
        filasInvalidas.push(index + 2);
        continue;
      }

      if (productosArchivo.has(nombre)) {
        productosDuplicados.add(nombre);
        continue;
      }

      productosArchivo.set(nombre, {
        nombre,
        categoria,
      });
    }

    if (filasInvalidas.length) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `El archivo contiene filas con nombre o categoría vacíos: ${filasInvalidas.join(
          ', ',
        )}`,
      });
    }

    if (productosDuplicados.size) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `El archivo contiene productos duplicados: ${Array.from(
          productosDuplicados,
        )
          .sort()
          .join(', ')}`,
      });
    }

    if (!productosArchivo.size) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'El archivo no contiene productos válidos para importar',
      });
    }

    const productos = Array.from(productosArchivo.values());

    /*
     * 2. Obtenemos las categorías necesarias con UNA query.
     */
    const nombresCategorias = [
      ...new Set(productos.map((producto) => producto.categoria)),
    ];

    const categorias = await this.r26CategoriaCaptacion.findMany({
      where: {
        R26Activ: true,

        R26Nom: {
          in: nombresCategorias,
          mode: 'insensitive',
        },
      },

      select: {
        R26Id: true,
        R26Nom: true,
      },
    });

    const categoriasMap = new Map(
      categorias.map((categoria) => [
        this._normalizeName(categoria.R26Nom),
        categoria.R26Id,
      ]),
    );

    /*
     * 3. Detectamos categorías inexistentes antes
     * de comenzar la inserción.
     */
    const categoriasNoEncontradas = [
      ...new Set(
        productos
          .filter((producto) => !categoriasMap.has(producto.categoria))
          .map((producto) => producto.categoria),
      ),
    ];

    if (categoriasNoEncontradas.length) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `Categorías de captación no encontradas: ${categoriasNoEncontradas.join(', ')}`,
      });
    }

    /*
     * 4. Consultamos todos los productos existentes
     * de la cooperativa con UNA query.
     */
    const nombresProductos = productos.map((producto) => producto.nombre);

    const productosExistentes = await this.r27ProductoCaptacion.findMany({
      where: {
        R27Coop_id: coopId,

        R27Nom: {
          in: nombresProductos,
        },
      },

      select: {
        R27Nom: true,
      },
    });

    const nombresExistentes = new Set(
      productosExistentes.map((producto) => producto.R27Nom),
    );

    /*
     * 5. Construimos solamente los productos realmente
     * nuevos.
     */
    const productosToCreate: Prisma.R27ProductoCaptacionCreateManyInput[] =
      productos
        .filter((producto) => !nombresExistentes.has(producto.nombre))
        .map((producto) => ({
          R27Nom: producto.nombre,

          R27Cat_id: categoriasMap.get(producto.categoria)!,

          R27Coop_id: coopId,

          R27Activ: true,
        }));

    if (!productosToCreate.length) {
      return {
        success: false,
        message:
          'No se encontraron productos nuevos para agregar. Los productos del archivo ya existen en la cooperativa.',
      };
    }

    /*
     * 6. Una única inserción masiva.
     *
     * skipDuplicates sigue siendo útil como protección
     * adicional ante concurrencia porque la DB tiene:
     *
     * @@unique([R27Coop_id, R27Nom])
     */
    try {
      const result = await this.r27ProductoCaptacion.createMany({
        data: productosToCreate,
        skipDuplicates: true,
      });

      return {
        success: true,
        message: `${result.count} productos de captación creados exitosamente.`,
      };
    } catch (error) {
      this._handlePrismaError(
        error,
        'No fue posible importar los productos de captación',
      );
    }
  }

  // ============================================================
  // PRIVATE
  // ============================================================

  private _normalizeName(value: string): string {
    return value.trim().toLowerCase();
  }

  private async _validateCategoria(categoriaId: string): Promise<void> {
    const categoria = await this.r26CategoriaCaptacion.findFirst({
      where: {
        R26Id: categoriaId,
        R26Activ: true,
      },

      select: {
        R26Id: true,
      },
    });

    if (!categoria) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `La categoría de captación con id ${categoriaId} no existe o está desactivada`,
      });
    }
  }

  private _handlePrismaError(error: unknown, context: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message:
            'Ya existe un producto de captación con ese nombre en la cooperativa',
        });
      }
    }

    const message = error instanceof Error ? error.message : String(error);

    this._logger.error(
      `${context}: ${message}`,
      error instanceof Error ? error.stack : undefined,
    );

    throw new RpcException({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: context,
    });
  }
}
