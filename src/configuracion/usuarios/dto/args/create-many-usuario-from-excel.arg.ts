import { Field, ID, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsArray, IsUUID, ValidateNested } from "class-validator";
import { CreateUsuarioImportDto } from "../inputs/create-usuario-import.dto";


@InputType()
export class CreateManyUsuariosFromExcelArgs {

    @Field(() => [CreateUsuarioImportDto])
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateUsuarioImportDto)
    data: CreateUsuarioImportDto[]

    @Field(() => ID)
    @IsUUID()
    coopId: string

}