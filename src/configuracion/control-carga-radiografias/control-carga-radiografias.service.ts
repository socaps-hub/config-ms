import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateC01ControlCargaInput } from './dto/inputs/create-control-carga.input';
import { C01ControlCarga } from './entites/control-carga-radiografia.entity';

@Injectable()
export class ControlCargaRadiografiasService extends PrismaClient implements OnModuleInit {

  private readonly _logger = new Logger('ControlCargaRadiografiasService')
  
  async onModuleInit() {
    await this.$connect();
    this._logger.log('Database connected')
  }

 /**
   * 🧾 Crea un nuevo registro en C01ControlCarga
   * No valida duplicados: las cargas se acumulan mes a mes.
   */
  async createControlCarga(input: CreateC01ControlCargaInput): Promise<C01ControlCarga> {
    const { C01CooperativaCodigo, C01Archivo } = input;

    const newRecord = await this.c01ControlCarga.create({
      data: {
        C01CooperativaCodigo,
        C01Archivo: C01Archivo ?? '',
        C01FechaCarga: new Date(),
        C01PeriodoMes: new Date().getMonth() + 1,
        C01PeriodoAnio: new Date().getFullYear(),
      },
    });

    return {
      ...newRecord,
      C01Archivo: newRecord.C01Archivo ?? undefined,
    };
  }

}
