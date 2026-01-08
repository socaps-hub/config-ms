import { InputType, Field, Int } from "@nestjs/graphql";
import { IsNumber, IsString } from "class-validator";

@InputType()
export class CreateModuloInput {
  @Field(() => String)
  @IsString()
  M02Codigo: string;

  @Field(() => String)
  @IsString()
  M02Nombre: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  M02Orden?: number;
}
