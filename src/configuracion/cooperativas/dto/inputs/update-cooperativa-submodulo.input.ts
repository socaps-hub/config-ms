import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

@InputType()
export class UpdateCooperativaSubModuloInput {

  @Field(() => Int)
  @IsNumber()
  C03Id: number;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  C03Activo?: boolean;
}
