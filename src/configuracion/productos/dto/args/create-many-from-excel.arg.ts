import { Field, ID, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsArray, IsUUID, ValidateNested } from "class-validator";
import { CreateProductoImportDto } from "../inputs/create-producto-import.dto";


@InputType()
export class CreateManyFromExcelArgs {

    @Field(() => [CreateProductoImportDto])
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateProductoImportDto)
    data: CreateProductoImportDto[]

    @Field(() => ID)
    @IsUUID()
    coopId: string

}