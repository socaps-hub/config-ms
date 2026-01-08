import { Field, InputType, Int } from '@nestjs/graphql';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class AssignCooperativaModuloInput {

  @Field(() => String)
  @IsString()
  C02CoopId: string;

  @Field(() => Int)
  @IsNumber()
  C02ModuloId: number;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  C02FechaInicio?: Date;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  C02FechaFin?: Date;
}
