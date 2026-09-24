import { formatYYYYMMDD } from "./date.util";

export class ExcelUtils {
  /**
   * Convierte fechas provenientes de Excel (serial, texto o Date)
   * Retorna SIEMPRE YYYY-MM-DD (fecha de negocio, sin UTC)
   */
  static parseExcelDate(value: any): string | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    // 1. Serial de Excel
    if (typeof value === 'number') {
      const base = new Date(1899, 11, 30);
      base.setDate(base.getDate() + value);

      return formatYYYYMMDD(base);
    }

    // 2. String
    if (typeof value === 'string') {
      const clean = value.trim();

      if (!clean) {
        return null;
      }

      // dd/MM/yyyy
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(clean)) {
        const [d, m, y] = clean.split('/');

        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }

      // dd.MM.yyyy
      if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(clean)) {
        const [d, m, y] = clean.split('.');

        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }

      // yyyy-MM-dd
      if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(clean)) {
        const [y, m, d] = clean.split('-');

        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }
    }

    // 3. Date
    if (value instanceof Date && !isNaN(value.getTime())) {
      return formatYYYYMMDD(value);
    }

    return null;
  }
}
