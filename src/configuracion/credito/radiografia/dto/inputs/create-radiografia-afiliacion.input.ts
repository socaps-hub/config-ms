import { Field, Float, InputType, Int } from '@nestjs/graphql';

import { IsInt, IsNumber, IsString } from 'class-validator';

@InputType()
export class CreateRA03AfiliacionInput {
  @Field(() => String)
  @IsString()
  RA03Cag: string;

  @Field(() => String)
  @IsString()
  RA03NombreSocio: string;

  @Field(() => String)
  @IsString()
  RA03Sexo: string;

  @Field(() => String)
  @IsString()
  RA03Ocupacion: string;

  @Field(() => String)
  @IsString()
  RA03Escolaridad: string;

  @Field(() => String)
  @IsString()
  RA03Riesgo: string;

  @Field(() => String)
  @IsString()
  RA03Sucursal: string;

  @Field(() => String)
  @IsString()
  RA03FechaPagoParteSocial: string;

  @Field(() => Float)
  @IsNumber()
  RA03ParteSocialPagada: number;

  @Field(() => String)
  @IsString()
  RA03FechaRetiro: string;

  @Field(() => Float)
  @IsNumber()
  RA03Monto: number;

  @Field(() => Float)
  @IsNumber()
  RA03Monto2: number;

  @Field(() => String)
  @IsString()
  RA03TipoPersona: string;

  @Field(() => Int)
  @IsInt()
  RA03Anio: number;
}
