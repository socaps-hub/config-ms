import { Field, InputType, Int } from "@nestjs/graphql";
import { IsNumber, IsOptional, IsString } from "class-validator";

@InputType()
export class CreateSubModuloInput {

    @Field(() => String)
    @IsString()
    M03Codigo: string;

    @Field(() => String)
    @IsString()
    M03Nombre: string;

    @Field(() => Int, { nullable: true })
    @IsOptional()
    @IsNumber()
    M03Orden?: number;

    @Field(() => Int)
    @IsNumber()
    M03ModuloId: number;

}