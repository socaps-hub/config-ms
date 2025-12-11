export class NormalizadorHelper {
  
  static limpiar(str: string = ''): string {
    return str
      ?.toUpperCase()
      .normalize('NFD')                 // quitar acentos
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9 ]/g, '')       // quitar símbolos raros
      .replace(/\s+/g, ' ')
      .trim();
  }
}
