import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';

import { CreateRA01CreditoInput } from './dto/inputs/create-radiografia-credito.input';
import { ExcelService } from 'src/common/excel/services/excel.service';
import { ExcelUtils } from 'src/common/excel/utils/excel.utils';
import { RadioAreaEnum } from 'src/configuracion/control-carga-radiografias/enums/control-carga-radio-area.enum';
import { CreateRA02CaptacionInput } from './dto/inputs/create-radiografia-captacion.input';

const MESES_MAP: Record<string, number> = {
  'enero': 1,
  'febrero': 2,
  'marzo': 3,
  'abril': 4,
  'mayo': 5,
  'junio': 6,
  'julio': 7,
  'agosto': 8,
  'septiembre': 9,
  'setiembre': 9, // por compatibilidad
  'octubre': 10,
  'noviembre': 11,
  'diciembre': 12,
};


@Injectable()
export class RadiografiaService extends PrismaClient implements OnModuleInit {
  private readonly _logger = new Logger('RadiografiaService');

  private router = {
    CREDITO: this.parseFileAndBuildCreateRA01CreditoInput.bind(this),

    CAPTACION: this.parseFileAndBuildCreateRA02CaptacionInput.bind(this),
  };

  constructor(private readonly excelService: ExcelService) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this._logger.log('Database connected');
  }

  public async executeCarga(
    key: string,
    cooperativaId: string,
    area: RadioAreaEnum,
  ) {
    const handler = this.router[area];

    if (!handler) {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Carga no implementada para área: ${area}`,
      });
    }

    return handler(key, cooperativaId);
  }

  // ===================================
  // CREDITO
  // ===================================
  /**
   *  Lee un archivo Excel desde una ruta física,
   * lo convierte a CreateRA01CreditoInput[],
   * y ejecuta la carga masiva en la base de datos.
   */
  public async parseFileAndBuildCreateRA01CreditoInput(
    key: string,
    cooperativaCodigo: string,
  ) {
    try {
      this._logger.log(`📂 Leyendo archivo Excel desde: ${key}`);

      // 1️⃣ Leer Excel a JSON genérico
      const json = await this.excelService.readExcelAsJsonFromS3(key);

      if (!json || json.length === 0) {
        throw new RpcException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'El archivo Excel no contiene datos.',
        });
      }

      // 2️⃣ Convertir filas a CreateRA01CreditoInput[]
      const creditos: CreateRA01CreditoInput[] = json.map((row) => ({
        RA01NumeroDeCredito: row['Numero de Crédito']?.toString() ?? '',
        RA01Tipo: row['Tipo']?.toString() ?? '',
        RA01Categoria: row['Categoria']?.toString() ?? '',
        RA01Finalidad: row['Finalidad']?.toString() ?? '',
        RA01DestinoAgropecuario: row['Destino Agropecuario']?.toString() ?? '',
        RA01FormaPago: row['Forma Pago']?.toString() ?? '',
        RA01FEntrega: ExcelUtils.parseExcelDate(row['F/Entrega']) || '',
        RA01FVencimiento: ExcelUtils.parseExcelDate(row['F.Vencimiento']) || '',
        RA01PeriodicidadCapital: Number(row['Periodicidad Capital'] ?? 0),
        RA01PeriodicidadIntereses: Number(row['Periodicidad Intereses'] ?? 0),
        RA01Plazo: Number(row['Plazo'] ?? 0),
        RA01Abonos: row['Abonos']?.toString() ?? '',
        RA01CEntregada: Number(row['C.Entregada'] ?? 0),
        RA01Microcredito: Number(row['MicroCredito'] ?? 0),
        RA01TipoDeAutorizacion: row['Tipo de Autorizacion']?.toString() ?? '',
        RA01UsrAutorizacion: row['Usr Autorizacion']?.toString() ?? '',
        RA01UsrSolicitud: row['Usr. Solicitud']?.toString() ?? '',
        RA01Sucursal: row['Sucursal']?.toString() ?? '',
        RA01TasaOrdinaria: Number(row['Tasa Ordinaria'] ?? 0),
        RA01TasaMoratoria: Number(row['Tasa Moratoria'] ?? 0),
        RA01EstimacionCapital: Number(row['Estimacion Capital'] ?? 0),
        RA01EstimacionInteres: Number(row['Estimacion Interes'] ?? 0),
        RA01EstimacionAdicionalPorInteresesEnCarteraVencida:
          row[
            'Estimacion Adicional por intereses en cartera vencida'
          ]?.toString() ?? '',
        RA01OrdenoEprc: row['Ordeno EPRC']?.toString() ?? '',
        RA01TotalEstimado: Number(row['Total Estimado'] ?? 0),
        RA01CalificacionParteCubierta: Number(
          row['Calificacion parte cubierta'] ?? 0,
        ),
        RA01CalificacionParteExpuesta: Number(
          row['Calificacion parte expuesta'] ?? 0,
        ),
        RA01ParteCubierta: row['Parte Cubierta']?.toString() ?? '',
        RA01ParteExpuesta: Number(row['Parte Expuesta'] ?? 0),
        RA01MontoEstPartCubierta: Number(row['Monto Est.Part.Cubierta'] ?? 0),
        RA01MontoEstPartExpuesta: Number(row['Monto Est.Part.Expuesta'] ?? 0),
        RA01TipoDeCartera: row['Tipo de Cartera']?.toString() ?? '',
        RA01GarantiaHipotecaria: Number(row['Garantia Hipotecaria'] ?? 0),
        RA01Formalizada: row['Formalizada']?.toString() ?? '',
        RA01LibreGravamen: row['Libre Gravamen']?.toString() ?? '',
        RA01FavorSociedad: row['Favor Sociedad']?.toString() ?? '',
        RA01AvaluoActuallizado: row['Avaluo Actualizado']?.toString() ?? '',
        RA01DepositoGarantia: Number(row['Deposito Garantia'] ?? 0),
        RA01GarantiaLiquida: Number(row['Garantia Liquida'] ?? 0),
        RA01CreditoRedescontado: row['Credito Redescontado']?.toString() ?? '',
        RA01InstitucionFuenteRecursos:
          row['Institucion fuente recursos']?.toString() ?? '',
        RA01PorcentajeGarantia: Number(row['Porcentaje Garantia'] ?? 0),
        RA01GarantiaPrendaria: Number(row['Garantia Prendaria'] ?? 0),
        RA01NumeroCag: row['Numero CAG']?.toString() ?? '',
        RA01NumeroDeSocio: row['Numero de socio']?.toString() ?? '',
        RA01Nombre: row['Nombre']?.toString() ?? '',
        RA01RazonSocial: row['Razon Social']?.toString() ?? '',
        RA01Sexo: row['Sexo']?.toString() ?? '',
        RA01FIngreso: ExcelUtils.parseExcelDate(row['F.Ingreso']) || '',
        RA01FNacimiento: ExcelUtils.parseExcelDate(row['F.Nacimiento']) || '',
        RA01SocioRelacionado: row['Socio Relacionado']?.toString() ?? '',
        RA01Calle: row['Calle']?.toString() ?? '',
        RA01NoCivico: row['No. Civico']?.toString() ?? '',
        RA01Colonia: row['Colonia']?.toString() ?? '',
        RA01Ciudad: row['Ciudad']?.toString() ?? '',
        RA01Municipio: row['Municipio']?.toString() ?? '',
        RA01Estado: row['Estado']?.toString() ?? '',
        RA01CodPostal: row['Cod.Postal']?.toString() ?? '',
        RA01Telefono: row['Telefono']?.toString() ?? '',
        RA01Marginada: row['Marginada']?.toString() ?? '',
        RA01GradoEstudios: row['Grado Estudios']?.toString() ?? '',
        RA01Ocupacion: row['Ocupacion']?.toString() ?? '',
        RA01Curp: row['CURP']?.toString() ?? '',
        RA01Rfc: row['RFC']?.toString() ?? '',
        RA01Riesgo: row['Riesgo']?.toString() ?? '',
        RA01Ingresos: Number(row['Ingresos'] ?? 0),
        RA01TendenciaGastos: Number(row['Tendencia Gastos'] ?? 0),
        RA01MontoHaberes: Number(row['Monto Haberes'] ?? 0),
        RA01CapitalCobrado: Number(row['Capital Cobrado'] ?? 0),
        RA01CapitalVencido: Number(row['Capital Vencido'] ?? 0),
        RA01AbonosVencidos: Number(row['Abonos Vencidos'] ?? 0),
        RA01DiasMora: Number(row['Dias Mora'] ?? 0),
        RA01DiasParaVencer: Number(row['Dias para Vencer'] ?? 0),
        RA01FechaUltimoPagoCapital:
          row['Fecha Ultimo Pago Capital']?.toString() ?? '',
        RA01MontoUltPagoCapital: Number(row['Monto Ult Pago Capital'] ?? 0),
        RA01FechaUltimoPagoInteres:
          row['Fecha Ult Pago Interes']?.toString() ?? '',
        RA01MontoUltPagoInteres: Number(row['Monto Ult Pago Interes'] ?? 0),
        RA01FechaCambioSituacion:
          row['Fecha Cambio Situacion']?.toString() ?? '',
        RA01InteresMoratorio: Number(row['Interes Moratorio'] ?? 0),
        RA01InteresMoratorioCobrado: Number(
          row['Interes Moratorio Cobrado'] ?? 0,
        ),
        RA01InteresMoratorioCarteraVe: Number(
          row['Interes Moratorio Cartera Ve'] ?? 0,
        ),
        RA01InteresMoratorioCtaOrden: Number(
          row['Interes Moratorio Cta Orden'] ?? 0,
        ),
        RA01InteresNormal: Number(row['Interes Normal'] ?? 0),
        RA01InteresNormalCobrado: Number(row['Interes Normal Cobrado'] ?? 0),
        RA01InteresNormalCarteraVe: Number(
          row['Interes Normal Cartera Ve'] ?? 0,
        ),
        RA01InteresNormalCtaOrden: Number(row['Interes Normal Cta Orden'] ?? 0),
        RA01InteresProximoAbono: Number(row['Interes Proximo Abono'] ?? 0),
        RA01FechaProximoAbono:
          ExcelUtils.parseExcelDate(row['Fecha Proximo Abono']) || '',
        RA01SaldoCapitalCartVig: Number(row['Saldo Capital Cart.Vig'] ?? 0),
        RA01SaldoCapitalCartVen: Number(row['Saldo Capital Cart.Ven'] ?? 0),
        RA01TipoDeCobranza: row['Tipo de Cobranza']?.toString() ?? '',
        RA01VigenteOVencido: row['Vigente o Vencido']?.toString() ?? '',
        RA01FPrimeramortvencida: row['F.PrimerAmortVencida']?.toString() ?? '',
        RA01FConsultaburo: row['F/ConsultaBuro']?.toString() ?? '',
        RA01SituacionDelCredito: row['Situacion del Credito']?.toString() ?? '',
      }));

      // 3️⃣ Crear la carga masiva en DB (transacción)
      const result = await this.crearCargaMasivaRadiografiaCredito(
        cooperativaCodigo,
        key.split('/').pop() ?? 'archivo.xlsx',
        creditos,
      );

      this._logger.log(
        `✅ Carga completada: ${result.totalRegistros} registros insertados`,
      );
      return result;
    } catch (error) {
      this._handleRpcError(error, 'Error procesando radiografía de Crédito');
    }
  }

  async crearCargaMasivaRadiografiaCredito(
    cooperativaCodigo: string,
    archivo: string,
    creditos: CreateRA01CreditoInput[],
  ) {
    try {
      const { periodoMes, periodoAnio, nombreMes } =
        this._getNumMesAndYearFromFileName(archivo);

      // 🔹 Validar si ya existe carga para ese periodo
      await this._validarCargaExistente(
        cooperativaCodigo,
        periodoMes,
        periodoAnio,
        RadioAreaEnum.CREDITO,
        nombreMes,
      );

      return await this.$transaction(
        async (tx) => {
          // 1️⃣ Crear registro de control de carga
          const control = await tx.c01ControlCarga.create({
            data: {
              C01CooperativaCodigo: cooperativaCodigo,
              C01Archivo: archivo,
              C01FechaCarga: new Date(),
              C01PeriodoMes: periodoMes,
              C01PeriodoAnio: periodoAnio,
              C01Area: RadioAreaEnum.CREDITO,
            },
          });

          const controlId = control.C01Id;

          // 2️⃣ Preparar los créditos con cálculo del total de cartera
          const registros = creditos.map((c) => ({
            ...c,
            RA01ControlId: controlId,
            RA01TotalCartera: this._calcularTotalCartera(c),
          }));

          // Validación preventiva
          if (!registros.length) {
            throw new RpcException({
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'No se encontraron créditos válidos para insertar.',
            });
          }

          // 3️⃣ Inserción masiva dentro de la misma transacción
          const result = await tx.rA01Credito.createMany({
            data: registros,
          });

          // Validar inserción
          if (result.count === 0) {
            throw new RpcException({
              statusCode: HttpStatus.BAD_REQUEST,
              message:
                'No se insertó ningún registro en RA01Credito. Operación cancelada.',
            });
          }

          this._logger.log(
            `✅ ${result.count} créditos insertados para cooperativa ${cooperativaCodigo} (controlId: ${controlId})`,
          );

          return {
            totalRegistros: result.count,
            controlId,
          };
        },
        { timeout: 30000 },
      );
    } catch (error) {
      this._handleRpcError(
        error,
        'Error en carga masiva de radiografía de Crédito',
      );
    }
  }

  // ===================================
  // CAPTACION
  // ===================================
  public async parseFileAndBuildCreateRA02CaptacionInput(
    key: string,
    cooperativaCodigo: string,
  ) {
    try {
      this._logger.log(`Leyendo radiografía de Captación desde: ${key}`);

      // 1. Leer Excel desde S3
      const json = await this.excelService.readExcelAsJsonFromS3(key);

      if (!json || json.length === 0) {
        throw new RpcException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'El archivo Excel no contiene datos.',
        });
      }

      // 2. Convertir las filas del Excel al DTO de Captación
      const captaciones: CreateRA02CaptacionInput[] = json.map((row) => ({
        RA02Nombre: row['NOMBRE']?.toString().trim() ?? '',

        RA02Sexo: row['SEXO']?.toString().trim() ?? '',

        RA02Ocupacion: row['OCUPACION']?.toString().trim() ?? '',

        RA02Escolaridad: row['ESCOLARIDAD']?.toString().trim() ?? '',

        RA02Cag: row['CAG']?.toString().trim() ?? '',

        RA02TipoPersona: row['TIPO PERSONA']?.toString().trim() ?? '',

        RA02FechaIngreso: ExcelUtils.parseExcelDate(row['FECHA INGRESO']) ?? '',

        RA02FechaNacimiento:
          ExcelUtils.parseExcelDate(row['FECHA NACIMIENTO']) ?? '',

        RA02FechaApertura:
          ExcelUtils.parseExcelDate(row['FECHA APERTURA']) ?? '',

        RA02Vencimiento: this._parseVencimientoCaptacion(row['VENCIMIENTO']),

        RA02PlazoDias: Number(row['PLAZO EN DIAS'] ?? 0),

        RA02TasaAnual: Number(row['TASA ANUAL'] ?? 0),

        RA02SaldoCapital: Number(row['SALDO CAPITAL'] ?? 0),

        RA02DevengadosPf: Number(row['DEVENGADOS PF'] ?? 0),

        RA02SaldoTotal: Number(row['SALDO TOTAL'] ?? 0),

        RA02Depositos: Number(row['DEPOSITOS'] ?? 0),

        RA02Retiros: Number(row['RETIROS'] ?? 0),

        RA02Sucursal: row['SUCURSAL']?.toString().trim() ?? '',

        RA02Producto: row['PRODUCTO']?.toString().trim() ?? '',

        RA02ClasificacionContable:
          row['CLASIFICACION CONTABLE']?.toString().trim() ?? '',

        RA02Riesgos: row['RIESGOS']?.toString().trim() ?? '',

        RA02Direccion: row['DIRECCION']?.toString().trim() ?? '',

        RA02Colonia: row['COLONIA']?.toString().trim() ?? '',

        RA02Localidad: row['LOCALIDAD']?.toString().trim() ?? '',

        RA02Municipio: row['MUNICIPIO']?.toString().trim() ?? '',

        RA02Estado: row['ESTADO']?.toString().trim() ?? '',

        RA02UsuarioApertura: row['USUARIO APERTURA']?.toString().trim() ?? '',

        RA02Cuenta: row['CUENTA']?.toString().trim() ?? '',

        RA02Relacion: row['RELACION']?.toString().trim() ?? '',

        RA02Cargo: row['CARGO']?.toString().trim() ?? '',

        RA02UltimoDeposito:
          ExcelUtils.parseExcelDate(row['ULTIMO DEPOSITO']) ?? '',

        RA02InteresDelMes: Number(row['INTERES DEL MES'] ?? 0),

        RA02UltimoMovimiento:
          ExcelUtils.parseExcelDate(row['ULTIMO MOVIMIENTO']) ?? '',
      }));

      if (!captaciones.length) {
        throw new RpcException({
          statusCode: HttpStatus.BAD_REQUEST,
          message:
            'No se encontraron registros de Captación válidos para procesar.',
        });
      }

      // 3. Persistencia
      const result = await this.crearCargaMasivaRadiografiaCaptacion(
        cooperativaCodigo,
        key.split('/').pop() ?? 'archivo.xlsx',
        captaciones,
      );

      this._logger.log(
        `✅ Carga de Captación completada: ${result.totalRegistros} registros insertados`,
      );

      return result;
    } catch (error) {
      this._handleRpcError(error, 'Error procesando radiografía de Captación');
    }
  }

  async crearCargaMasivaRadiografiaCaptacion(
    cooperativaCodigo: string,
    archivo: string,
    captaciones: CreateRA02CaptacionInput[],
  ) {
    try {
      const { periodoMes, periodoAnio, nombreMes } =
        this._getNumMesAndYearFromFileName(archivo);

      await this._validarCargaExistente(
        cooperativaCodigo,
        periodoMes,
        periodoAnio,
        RadioAreaEnum.CAPTACION,
        nombreMes,
      );

      return await this.$transaction(
        async (tx) => {
          // 1. Crear control de carga
          const control = await tx.c01ControlCarga.create({
            data: {
              C01CooperativaCodigo: cooperativaCodigo,

              C01Archivo: archivo,

              C01FechaCarga: new Date(),

              C01PeriodoMes: periodoMes,

              C01PeriodoAnio: periodoAnio,

              C01Area: RadioAreaEnum.CAPTACION,
            },
          });

          const controlId = control.C01Id;

          // 2. Asociar todos los registros
          //    al control recién creado.
          const registros = captaciones.map((captacion) => ({
            ...captacion,
            RA02ControlId: controlId,
          }));

          if (!registros.length) {
            throw new RpcException({
              statusCode: HttpStatus.BAD_REQUEST,
              message:
                'No se encontraron registros de Captación válidos para insertar.',
            });
          }

          // 3. Inserción masiva
          const result = await tx.rA02Captacion.createMany({
            data: registros,
          });

          if (result.count === 0) {
            throw new RpcException({
              statusCode: HttpStatus.BAD_REQUEST,
              message:
                'No se insertó ningún registro en RA02Captacion. Operación cancelada.',
            });
          }

          this._logger.log(
            `✅ ${result.count} registros de Captación insertados para cooperativa ${cooperativaCodigo} (controlId: ${controlId})`,
          );

          return {
            totalRegistros: result.count,
            controlId,
          };
        },
        {
          timeout: 30000,
        },
      );
    } catch (error) {
      this._handleRpcError(
        error,
        'Error en carga masiva de radiografía de Captación',
      );
    }
  }

  // ====================================
  // HELPERS
  // ====================================
  private async _validarCargaExistente(
    cooperativaCodigo: string,
    periodoMes: number,
    periodoAnio: number,
    area: RadioAreaEnum,
    nombreMes: string,
  ): Promise<void> {
    const existeCarga = await this.c01ControlCarga.findFirst({
      where: {
        C01CooperativaCodigo: cooperativaCodigo,
        C01PeriodoMes: periodoMes,
        C01PeriodoAnio: periodoAnio,
        C01Area: area,
      },
    });

    if (existeCarga) {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Ya existe una carga de ${area} para ${cooperativaCodigo} en ${nombreMes} (${periodoMes}/${periodoAnio}).`,
      });
    }
  }

  /**
   * Calcula el campo RA01TotalCartera
   * Suma: Interes Moratorio + Interes Moratorio Cartera Ve +
   *        Interes Normal + Saldo Capital Cart.Vig + Saldo Capital Cart.Ven
   */
  private _calcularTotalCartera(c: CreateRA01CreditoInput): number {
    const n = (v?: number) => (v ? Number(v) : 0);
    return (
      n(c.RA01InteresMoratorio) +
      n(c.RA01InteresMoratorioCarteraVe) +
      n(c.RA01InteresNormal) +
      n(c.RA01InteresNormalCarteraVe) +
      n(c.RA01SaldoCapitalCartVig) +
      n(c.RA01SaldoCapitalCartVen)
    );
  }

  private _getNumMesAndYearFromFileName(archivo: string) {
    // 🔹 Extraer el nombre del mes del archivo (e.g. “...-Febrero.xlsx”)
    const nombreArchivoSinExtension = archivo.replace('.xlsx', '');
    const partes = nombreArchivoSinExtension.split('-');
    const nombreMes = partes[partes.length - 2].trim().toLowerCase();
    const periodoAnio =
      +partes[partes.length - 1].trim() || new Date().getFullYear();

    // 🔹 Determinar número del mes y año actual
    const periodoMes = MESES_MAP[nombreMes] ?? new Date().getMonth() + 1;

    this._logger.log(`📅 Mes detectado: ${nombreMes} → ${periodoMes}`);

    return { periodoMes, periodoAnio, nombreMes };
  }

  private _parseVencimientoCaptacion(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const parsedDate = ExcelUtils.parseExcelDate(value);

    if (parsedDate) {
      return parsedDate;
    }

    return String(value).trim();
  }

  private _handleRpcError(error: unknown, context: string): never {
    if (error instanceof RpcException) {
      throw error;
    }

    const message = error instanceof Error ? error.message : String(error);

    this._logger.error(
      `${context}: ${message}`,
      error instanceof Error ? error.stack : undefined,
    );

    throw new RpcException({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: `${context}: ${message}`,
    });
  }
}
