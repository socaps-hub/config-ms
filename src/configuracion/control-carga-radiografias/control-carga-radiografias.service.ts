import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ControlCargaRadiografiasResponse } from './dto/outputs/control-carga-radiografias-response.output';

@Injectable()
export class ControlCargaRadiografiasService extends PrismaClient implements OnModuleInit {

  private readonly _logger = new Logger('ControlCargaRadiografiasService')
  
  async onModuleInit() {
    await this.$connect();
    this._logger.log('Database connected')
  }

  async getAll(): Promise<ControlCargaRadiografiasResponse> {
    const cargas = await this.c01ControlCarga.findMany({
      include: {
        cooperativa: {
          select: {
            R17Nom: true,
          },
        },
        _count: {
          select: {
            creditos: true,
          },
        },
      },
      orderBy: {
        C01FechaCarga: 'desc',
      },
    });

    const cargasMapped = cargas.map(c => ({
      C01Id: c.C01Id,
      C01CooperativaCodigo: c.C01CooperativaCodigo,
      C01CooperativaNombre: c.cooperativa.R17Nom,
      C01Archivo: c.C01Archivo ?? undefined,
      C01FechaCarga: c.C01FechaCarga.toISOString(),
      C01PeriodoMes: c.C01PeriodoMes,
      C01PeriodoAnio: c.C01PeriodoAnio,
      C01Area: c.C01Area,

      // 👇 contador eficiente
      totalCreditos: c._count.creditos,
    }));

    return { cargas: cargasMapped };
  }

 /**
   * 🧾 Crea un nuevo registro en C01ControlCarga
   * No valida duplicados: las cargas se acumulan mes a mes.
   */
  // async createControlCarga(input: CreateC01ControlCargaInput): Promise<C01ControlCarga> {
  //   const { C01CooperativaCodigo, C01Archivo } = input;

  //   const newRecord = await this.c01ControlCarga.create({
  //     data: {
  //       C01CooperativaCodigo,
  //       C01Archivo: C01Archivo ?? '',
  //       C01FechaCarga: new Date(),
  //       C01PeriodoMes: new Date().getMonth() + 1,
  //       C01PeriodoAnio: new Date().getFullYear(),
  //     },
  //   });

  //   return {
  //     ...newRecord,
  //     C01Archivo: newRecord.C01Archivo ?? undefined,
  //   };
  // }

}
