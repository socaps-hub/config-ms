import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';

@InputType()
export class AssignCooperativaSubModuloInput {

  @Field(() => Int)
  @IsNumber()
  C03CoopModuloId: number;

  @Field(() => Int)
  @IsNumber()
  C03SubModuloId: number;
}
