import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsDate, IsNumber, IsOptional } from 'class-validator';

@InputType()
export class UpdateCooperativaModuloInput {

  @Field(() => Int)
  @IsNumber()
  C02Id: number;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  C02Activo?: boolean;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  C02FechaInicio?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  C02FechaFin?: Date;
}
