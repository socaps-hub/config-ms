import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import { PrismaClient } from '@prisma/client';

import { CategoriaCaptacion } from './entities/categoria-captacion.entity';

@Injectable()
export class CategoriasCaptacionService extends PrismaClient implements OnModuleInit {
  private readonly _logger = new Logger(CategoriasCaptacionService.name);

  public async onModuleInit(): Promise<void> {
    await this.$connect();

    this._logger.log('Database connected');
  }

  public async findAll(): Promise<CategoriaCaptacion[]> {
    return this.r26CategoriaCaptacion.findMany({
      where: {
        R26Activ: true,
      },
      orderBy: {
        R26Nom: 'asc',
      },
    });
  }

  public async findOne(id: string): Promise<CategoriaCaptacion> {
    const categoria = await this.r26CategoriaCaptacion.findFirst({
      where: {
        R26Id: id,
        R26Activ: true,
      },
    });

    if (!categoria) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `La categoría de captación con id ${id} no existe o está desactivada`,
      });
    }

    return categoria;
  }
}
