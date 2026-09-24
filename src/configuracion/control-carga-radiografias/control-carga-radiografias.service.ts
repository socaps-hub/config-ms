import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient, RADIO_AREA } from '@prisma/client';
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
            captaciones: true,
          },
        },
      },
      orderBy: {
        C01FechaCarga: 'desc',
      },
    });

    const cargasMapped = cargas.map((c) => ({
      C01Id: c.C01Id,
      C01CooperativaCodigo: c.C01CooperativaCodigo,
      C01CooperativaNombre: c.cooperativa.R17Nom,
      C01Archivo: c.C01Archivo ?? undefined,
      C01FechaCarga: c.C01FechaCarga.toISOString(),
      C01PeriodoMes: c.C01PeriodoMes,
      C01PeriodoAnio: c.C01PeriodoAnio,
      C01Area: c.C01Area,

      totalRegistros: this._getTotalRegistros(c.C01Area, c._count),
    }));

    return {
      cargas: cargasMapped,
    };
  }

  private _getTotalRegistros(
    area: RADIO_AREA,
    counts: {
      creditos: number;
      captaciones: number;
    },
  ): number {
    switch (area) {
      case RADIO_AREA.CREDITO:
        return counts.creditos;

      case RADIO_AREA.CAPTACION:
        return counts.captaciones;

      default:
        return 0;
    }
  }

}
