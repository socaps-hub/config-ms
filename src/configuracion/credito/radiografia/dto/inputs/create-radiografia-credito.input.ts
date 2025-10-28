import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsNumber, IsString } from 'class-validator';

@InputType()
export class CreateRA01CreditoInput {
  @Field(() => String)
  @IsString()
  RA01NumeroDeCredito: string;

  @Field(() => String)
  @IsString()
  RA01Tipo: string;

  @Field(() => String)
  @IsString()
  RA01Categoria: string;

  @Field(() => String)
  @IsString()
  RA01Finalidad: string;

  @Field(() => String)
  @IsString()
  RA01DestinoAgropecuario: string;

  @Field(() => String)
  @IsString()
  RA01FormaPago: string;

  @Field(() => String)
  @IsString()
  RA01FEntrega: string;

  @Field(() => String)
  @IsString()
  RA01FVencimiento: string;

  @Field(() => Float)
  @IsNumber()
  RA01PeriodicidadCapital: number;

  @Field(() => Float)
  @IsNumber()
  RA01PeriodicidadIntereses: number;

  @Field(() => Int)
  @IsNumber()
  RA01Plazo: number;

  @Field(() => String)
  @IsString()
  RA01Abonos: string;

  @Field(() => Int)
  @IsNumber()
  RA01CEntregada: number;

  @Field(() => Float)
  @IsNumber()
  RA01Microcredito: number;

  @Field(() => String)
  @IsString()
  RA01TipoDeAutorizacion: string;

  @Field(() => String)
  @IsString()
  RA01UsrAutorizacion: string;

  @Field(() => String)
  @IsString()
  RA01UsrSolicitud: string;

  @Field(() => String)
  @IsString()
  RA01Sucursal: string;

  @Field(() => Float)
  @IsNumber()
  RA01TasaOrdinaria: number;

  @Field(() => Float)
  @IsNumber()
  RA01TasaMoratoria: number;

  @Field(() => Float)
  @IsNumber()
  RA01EstimacionCapital: number;

  @Field(() => Float)
  @IsNumber()
  RA01EstimacionInteres: number;

  @Field(() => String)
  @IsString()
  RA01EstimacionAdicionalPorInteresesEnCarteraVencida: string;

  @Field(() => String)
  @IsString()
  RA01OrdenoEprc: string;

  @Field(() => Float)
  @IsNumber()
  RA01TotalEstimado: number;

  @Field(() => Float)
  @IsNumber()
  RA01CalificacionParteCubierta: number;

  @Field(() => Float)
  @IsNumber()
  RA01CalificacionParteExpuesta: number;

  @Field(() => String)
  @IsString()
  RA01ParteCubierta: string;

  @Field(() => Float)
  @IsNumber()
  RA01ParteExpuesta: number;

  @Field(() => Float)
  @IsNumber()
  RA01MontoEstPartCubierta: number;

  @Field(() => Float)
  @IsNumber()
  RA01MontoEstPartExpuesta: number;

  @Field(() => String)
  @IsString()
  RA01TipoDeCartera: string;

  @Field(() => Float)
  @IsNumber()
  RA01GarantiaHipotecaria: number;

  @Field(() => String)
  @IsString()
  RA01Formalizada: string;

  @Field(() => String)
  @IsString()
  RA01LibreGravamen: string;

  @Field(() => String)
  @IsString()
  RA01FavorSociedad: string;

  @Field(() => String)
  @IsString()
  RA01AvaluoActuallizado: string;

  @Field(() => Float)
  @IsNumber()
  RA01DepositoGarantia: number;

  @Field(() => Float)
  @IsNumber()
  RA01GarantiaLiquida: number;

  @Field(() => String)
  @IsString()
  RA01CreditoRedescontado: string;

  @Field(() => String)
  @IsString()
  RA01InstitucionFuenteRecursos: string;

  @Field(() => Float)
  @IsNumber()
  RA01PorcentajeGarantia: number;

  @Field(() => Float)
  @IsNumber()
  RA01GarantiaPrendaria: number;

  @Field(() => String)
  @IsString()
  RA01NumeroCag: string;

  @Field(() => String)
  @IsString()
  RA01NumeroDeSocio: string;

  @Field(() => String)
  @IsString()
  RA01Nombre: string;

  @Field(() => String)
  @IsString()
  RA01RazonSocial: string;

  @Field(() => String)
  @IsString()
  RA01Sexo: string;

  @Field(() => String)
  @IsString()
  RA01FIngreso: string;

  @Field(() => String)
  @IsString()
  RA01FNacimiento: string;

  @Field(() => String)
  @IsString()
  RA01SocioRelacionado: string;

  @Field(() => String)
  @IsString()
  RA01Calle: string;

  @Field(() => String)
  @IsString()
  RA01NoCivico: string;

  @Field(() => String)
  @IsString()
  RA01Colonia: string;

  @Field(() => String)
  @IsString()
  RA01Ciudad: string;

  @Field(() => String)
  @IsString()
  RA01Municipio: string;

  @Field(() => String)
  @IsString()
  RA01Estado: string;

  @Field(() => String)
  @IsString()
  RA01CodPostal: string;

  @Field(() => String)
  @IsString()
  RA01Telefono: string;

  @Field(() => String)
  @IsString()
  RA01Marginada: string;

  @Field(() => String)
  @IsString()
  RA01GradoEstudios: string;

  @Field(() => String)
  @IsString()
  RA01Ocupacion: string;

  @Field(() => String)
  @IsString()
  RA01Curp: string;

  @Field(() => String)
  @IsString()
  RA01Rfc: string;

  @Field(() => String)
  @IsString()
  RA01Riesgo: string;

  @Field(() => Float)
  @IsNumber()
  RA01Ingresos: number;

  @Field(() => Float)
  @IsNumber()
  RA01TendenciaGastos: number;

  @Field(() => Float)
  @IsNumber()
  RA01MontoHaberes: number;

  @Field(() => Float)
  @IsNumber()
  RA01CapitalCobrado: number;

  @Field(() => Float)
  @IsNumber()
  RA01CapitalVencido: number;

  @Field(() => Int)
  @IsNumber()
  RA01AbonosVencidos: number;

  @Field(() => Int)
  @IsNumber()
  RA01DiasMora: number;

  @Field(() => Int)
  @IsNumber()
  RA01DiasParaVencer: number;

  @Field(() => String)
  @IsString()
  RA01FechaUltimoPagoCapital: string;

  @Field(() => Float)
  @IsNumber()
  RA01MontoUltPagoCapital: number;

  @Field(() => String)
  @IsString()
  RA01FechaUltimoPagoInteres: string;

  @Field(() => Float)
  @IsNumber()
  RA01MontoUltPagoInteres: number;

  @Field(() => String)
  @IsString()
  RA01FechaCambioSituacion: string;

  @Field(() => Float)
  @IsNumber()
  RA01InteresMoratorio: number;

  @Field(() => Float)
  @IsNumber()
  RA01InteresMoratorioCobrado: number;

  @Field(() => Float)
  @IsNumber()
  RA01InteresMoratorioCarteraVe: number;

  @Field(() => Float)
  @IsNumber()
  RA01InteresMoratorioCtaOrden: number;

  @Field(() => Float)
  @IsNumber()
  RA01InteresNormal: number;

  @Field(() => Float)
  @IsNumber()
  RA01InteresNormalCobrado: number;

  @Field(() => Float)
  @IsNumber()
  RA01InteresNormalCarteraVe: number;

  @Field(() => Float)
  @IsNumber()
  RA01InteresNormalCtaOrden: number;

  @Field(() => Float)
  @IsNumber()
  RA01InteresProximoAbono: number;

  @Field(() => String)
  @IsString()
  RA01FechaProximoAbono: string;

  @Field(() => Float)
  @IsNumber()
  RA01SaldoCapitalCartVig: number;

  @Field(() => Float)
  @IsNumber()
  RA01SaldoCapitalCartVen: number;

  @Field(() => String)
  @IsString()
  RA01TipoDeCobranza: string;

  @Field(() => String)
  @IsString()
  RA01VigenteOVencido: string;

  @Field(() => String)
  @IsString()
  RA01FPrimeramortvencida: string;

  @Field(() => String)
  @IsString()
  RA01FConsultaburo: string;

  @Field(() => String)
  @IsString()
  RA01SituacionDelCredito: string;

  // Relación al lote/carga (requerido para insertar)
  // @Field(() => Int)
  // @IsNumber()
  // RA01ControlId: number;
}
