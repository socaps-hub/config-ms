import { Field, Float, InputType, Int } from '@nestjs/graphql';

import { IsInt, IsNumber, IsString } from 'class-validator';

@InputType()
export class CreateRA02CaptacionInput {
  @Field(() => String)
  @IsString()
  RA02Nombre: string;

  @Field(() => String)
  @IsString()
  RA02Sexo: string;

  @Field(() => String)
  @IsString()
  RA02Ocupacion: string;

  @Field(() => String)
  @IsString()
  RA02Escolaridad: string;

  @Field(() => String)
  @IsString()
  RA02Cag: string;

  @Field(() => String)
  @IsString()
  RA02TipoPersona: string;

  @Field(() => String)
  @IsString()
  RA02FechaIngreso: string;

  @Field(() => String)
  @IsString()
  RA02FechaNacimiento: string;

  @Field(() => String)
  @IsString()
  RA02FechaApertura: string;

  @Field(() => String)
  @IsString()
  RA02Vencimiento: string;

  @Field(() => Int)
  @IsInt()
  RA02PlazoDias: number;

  @Field(() => Float)
  @IsNumber()
  RA02TasaAnual: number;

  @Field(() => Float)
  @IsNumber()
  RA02SaldoCapital: number;

  @Field(() => Float)
  @IsNumber()
  RA02DevengadosPf: number;

  @Field(() => Float)
  @IsNumber()
  RA02SaldoTotal: number;

  @Field(() => Float)
  @IsNumber()
  RA02Depositos: number;

  @Field(() => Float)
  @IsNumber()
  RA02Retiros: number;

  @Field(() => String)
  @IsString()
  RA02Sucursal: string;

  @Field(() => String)
  @IsString()
  RA02Producto: string;

  @Field(() => String)
  @IsString()
  RA02ClasificacionContable: string;

  @Field(() => String)
  @IsString()
  RA02Riesgos: string;

  @Field(() => String)
  @IsString()
  RA02Direccion: string;

  @Field(() => String)
  @IsString()
  RA02Colonia: string;

  @Field(() => String)
  @IsString()
  RA02Localidad: string;

  @Field(() => String)
  @IsString()
  RA02Municipio: string;

  @Field(() => String)
  @IsString()
  RA02Estado: string;

  @Field(() => String)
  @IsString()
  RA02UsuarioApertura: string;

  @Field(() => String)
  @IsString()
  RA02Cuenta: string;

  @Field(() => String)
  @IsString()
  RA02Relacion: string;

  @Field(() => String)
  @IsString()
  RA02Cargo: string;

  @Field(() => String)
  @IsString()
  RA02UltimoDeposito: string;

  @Field(() => Float)
  @IsNumber()
  RA02InteresDelMes: number;

  @Field(() => String)
  @IsString()
  RA02UltimoMovimiento: string;
}
