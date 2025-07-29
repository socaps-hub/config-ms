import { Field, ID, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsArray, IsUUID, ValidateNested } from "class-validator";
import { CreateSucursalImportDto } from "../inputs/create-sucursal-import.dto";


@InputType()
export class CreateManySucursalesFromExcelArgs {

    @Field(() => [CreateSucursalImportDto])
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateSucursalImportDto)
    data: CreateSucursalImportDto[]

    @Field(() => ID)
    @IsUUID()
    coopId: string

}