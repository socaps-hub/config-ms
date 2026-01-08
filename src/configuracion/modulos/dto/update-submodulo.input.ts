import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { IsNumber } from "class-validator";
import { CreateSubModuloInput } from "./create-submodulo.input";

@InputType()
export class UpdateSubModuloInput extends PartialType(CreateSubModuloInput) {

  @Field(() => String)
  @IsNumber()
  id: number;

}