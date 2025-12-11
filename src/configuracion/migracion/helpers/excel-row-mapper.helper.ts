import { mapeo } from './mapeo-elementos';
import { mapeoDesembolso } from './mapeo-elementos-desembolso';
import { mapeoSisconcap } from './mapeo-elementos-sisconcap';
import { NormalizadorHelper } from './normalizador.helper';

export class ExcelRowMapper {

  static obtenerCodigoElemento(nombreExcel: string): string | null {
    const key = NormalizadorHelper.limpiar(nombreExcel.trim());
    return mapeo[key] ?? null;
  }

  static obtenerCodigoElementoDesembolso(nombreExcel: string): string | null {
    const key = NormalizadorHelper.limpiar(nombreExcel.trim());
    return mapeoDesembolso[key] ?? null;
  }

  static obtenerCodigoElementoSisconcap(nombreExcel: string): string | null {
    const key = NormalizadorHelper.limpiar(nombreExcel.trim());
    return mapeoSisconcap[key] ?? null;
  }
}
