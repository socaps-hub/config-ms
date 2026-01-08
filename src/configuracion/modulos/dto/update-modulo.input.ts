import { InputType, PartialType, Field, ID, Int } from "@nestjs/graphql";
import { CreateModuloInput } from "./create-modulo.input";
import { IsNumber } from "class-validator";

@InputType()
export class UpdateModuloInput extends PartialType(CreateModuloInput) {

  @Field(() => Int)
  @IsNumber()
  id: number;

}
