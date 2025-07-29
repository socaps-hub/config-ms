import { Field, InputType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@InputType()
export class CreateSucursalImportDto {

  @Field(() => String)
  @IsString()
  Nombre: string;
  
  @Field(() => String)
  @IsString()
  Numero: string;
}
