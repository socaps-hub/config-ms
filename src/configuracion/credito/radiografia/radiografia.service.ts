import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { FileUpload } from 'graphql-upload-ts';

import { CreateRA01CreditoInput } from './dto/inputs/create-radiografia-credito.input';
import { ExcelService } from 'src/common/excel/services/excel.service';
import { ExcelUtils } from 'src/common/excel/utils/excel.utils';
import { RadioAreaEnum } from 'src/configuracion/control-carga-radiografias/enums/control-carga-radio-area.enum';

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

    private readonly _logger = new Logger('RadiografiaService')

    private router = {
        "CREDITO": this.parseFileAndBuildCreateRA01CreditoInput.bind(this),
    };

    constructor(
        private readonly excelService: ExcelService,
    ) {
        super();
    }

    async onModuleInit() {
        await this.$connect();
        this._logger.log('Database connected')
    }

    public async executeCarga(key: string, cooperativaId: string, area: RadioAreaEnum) {
        const keyDest = area;
        const handler = this.router[keyDest];

        if (!handler)
            throw new Error(`Carga no implementada para área: ${keyDest}`);

        return handler(key, cooperativaId);
    }
    
    /**
   * 📘 Lee un archivo Excel desde una ruta física,
   * lo convierte a CreateRA01CreditoInput[],
   * y ejecuta la carga masiva en la base de datos.
   */
    public async parseFileAndBuildCreateRA01CreditoInput(key: string, cooperativaCodigo: string) {
        try {
            this._logger.log(`📂 Leyendo archivo Excel desde: ${key}`);

            // 1️⃣ Leer Excel a JSON genérico
            const json = await this.excelService.readExcelAsJsonFromS3(key);

            if (!json || json.length === 0) {
                throw new Error('El archivo Excel no contiene datos.');
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
                    row['Estimacion Adicional por intereses en cartera vencida']?.toString() ?? '',
                RA01OrdenoEprc: row['Ordeno EPRC']?.toString() ?? '',
                RA01TotalEstimado: Number(row['Total Estimado'] ?? 0),
                RA01CalificacionParteCubierta: Number(row['Calificacion parte cubierta'] ?? 0),
                RA01CalificacionParteExpuesta: Number(row['Calificacion parte expuesta'] ?? 0),
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
                RA01InstitucionFuenteRecursos: row['Institucion fuente recursos']?.toString() ?? '',
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
                RA01FechaUltimoPagoCapital: row['Fecha Ultimo Pago Capital']?.toString() ?? '',
                RA01MontoUltPagoCapital: Number(row['Monto Ult Pago Capital'] ?? 0),
                RA01FechaUltimoPagoInteres: row['Fecha Ult Pago Interes']?.toString() ?? '',
                RA01MontoUltPagoInteres: Number(row['Monto Ult Pago Interes'] ?? 0),
                RA01FechaCambioSituacion: row['Fecha Cambio Situacion']?.toString() ?? '',
                RA01InteresMoratorio: Number(row['Interes Moratorio'] ?? 0),
                RA01InteresMoratorioCobrado: Number(row['Interes Moratorio Cobrado'] ?? 0),
                RA01InteresMoratorioCarteraVe: Number(row['Interes Moratorio Cartera Ve'] ?? 0),
                RA01InteresMoratorioCtaOrden: Number(row['Interes Moratorio Cta Orden'] ?? 0),
                RA01InteresNormal: Number(row['Interes Normal'] ?? 0),
                RA01InteresNormalCobrado: Number(row['Interes Normal Cobrado'] ?? 0),
                RA01InteresNormalCarteraVe: Number(row['Interes Normal Cartera Ve'] ?? 0),
                RA01InteresNormalCtaOrden: Number(row['Interes Normal Cta Orden'] ?? 0),
                RA01InteresProximoAbono: Number(row['Interes Proximo Abono'] ?? 0),
                RA01FechaProximoAbono: ExcelUtils.parseExcelDate(row['Fecha Proximo Abono']) || '',
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

            this._logger.log(`✅ Carga completada: ${result.totalRegistros} registros insertados`);
            return result;
        } catch (error) {
            this._logger.error(`❌ Error procesando Excel: ${error.message}`);
            throw error;
        }
    }

    async crearCargaMasivaRadiografiaCredito(
        cooperativaCodigo: string,
        archivo: string,
        creditos: CreateRA01CreditoInput[],
    ) {
        try {
            
            const { periodoMes, periodoAnio, nombreMes } = this._getNumMesAndYearFromFileName(archivo)

            // 🔹 Validar si ya existe carga para ese periodo
            const existeCarga = await this.c01ControlCarga.findFirst({
            where: {
                C01CooperativaCodigo: cooperativaCodigo,
                C01PeriodoMes: periodoMes,
                C01PeriodoAnio: periodoAnio,
            },
            });

            if (existeCarga) {
                throw new Error(
                    `Ya existe una carga para ${cooperativaCodigo} en ${nombreMes} (${periodoMes}/${periodoAnio}).`,
                );
            }

            return await this.$transaction(async (tx) => {
                // 1️⃣ Crear registro de control de carga
                const control = await tx.c01ControlCarga.create({
                    data: {
                        C01CooperativaCodigo: cooperativaCodigo,
                        C01Archivo: archivo,
                        C01FechaCarga: new Date(),
                        C01PeriodoMes: periodoMes,
                        C01PeriodoAnio: periodoAnio,
                        C01Area: RadioAreaEnum.CREDITO
                    },
                });

                const controlId = control.C01Id;

                // 2️⃣ Preparar los créditos con cálculo del total de cartera
                const registros = creditos.map((c) => ({
                    ...c,
                    RA01ControlId: controlId,
                    RA01TotalCartera: this.calcularTotalCartera(c),
                }));

                // Validación preventiva
                if (!registros.length) {
                    throw new Error('No se encontraron créditos válidos para insertar.');
                }

                // 3️⃣ Inserción masiva dentro de la misma transacción
                const result = await tx.rA01Credito.createMany({
                    data: registros,
                });

                // Validar inserción
                if (result.count === 0) {
                    throw new Error(
                        'No se insertó ningún registro en RA01Credito. Operación cancelada.',
                    );
                }

                this._logger.log(
                    `✅ ${result.count} créditos insertados para cooperativa ${cooperativaCodigo} (controlId: ${controlId})`,
                );

                return {
                    totalRegistros: result.count,
                    controlId,
                };
            }, { timeout: 30000 });
        } catch (error) {
            this._logger.error(`❌ Error en carga masiva de radiografía: ${error.message}`);
            throw `❌ Error en carga masiva de radiografía: ${error.message}`;
        }
    }


    /**
     * 🧮 Calcula el campo RA01TotalCartera
     * Suma: Interes Moratorio + Interes Moratorio Cartera Ve +
     *        Interes Normal + Saldo Capital Cart.Vig + Saldo Capital Cart.Ven
     */
    private calcularTotalCartera(c: CreateRA01CreditoInput): number {
        const n = (v?: number) => (v ? Number(v) : 0);
        return (
            n(c.RA01InteresMoratorio) +
            n(c.RA01InteresMoratorioCarteraVe) +
            n(c.RA01InteresNormal) +
            n(c.RA01SaldoCapitalCartVig) +
            n(c.RA01SaldoCapitalCartVen)
        );
    }

    private _getNumMesAndYearFromFileName(archivo: string) {
        // 🔹 Extraer el nombre del mes del archivo (e.g. “...-Febrero.xlsx”)
        const nombreArchivoSinExtension = archivo.replace('.xlsx', '');
        const partes = nombreArchivoSinExtension.split('-');
        const nombreMes = partes[partes.length - 2].trim().toLowerCase();
        const periodoAnio = +partes[partes.length - 1].trim() || new Date().getFullYear();

        // 🔹 Determinar número del mes y año actual
        const periodoMes = MESES_MAP[nombreMes] ?? (new Date().getMonth() + 1);

        this._logger.log(`📅 Mes detectado: ${nombreMes} → ${periodoMes}`);

        return { periodoMes, periodoAnio, nombreMes }
    }

}
