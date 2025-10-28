export class ExcelUtils {
  /**
   * Convierte fechas provenientes de Excel (serial, texto o ISO)
   */
  static parseExcelDate(value: any): string | null {
    if (!value) return null;

    if (typeof value === 'number') {
      const baseDate = new Date(Date.UTC(1899, 11, 30));
      const fecha = new Date(baseDate.getTime() + value * 86400000);
      return fecha.toISOString();
    }

    if (typeof value === 'string') {
      const parts = value.includes('/') ? value.split('/') : value.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 2) {
          const [d, m, y] = parts;
          return new Date(+y, +m - 1, +d).toISOString();
        } else {
          const [y, m, d] = parts;
          return new Date(+y, +m - 1, +d).toISOString();
        }
      }
    }

    const fecha = new Date(value);
    return isNaN(fecha.getTime()) ? null : fecha.toISOString();
  }
}
