import { Field, InputType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@InputType()
export class CreateUsuarioImportDto {

    @Field(() => String)
    @IsString()
    Nombre: string;
    
    @Field(() => String)
    @IsString()
    Sucursal: string;
    
    @Field(() => String)
    @IsString()
    Usuario: string;

    @Field(() => String)
    @IsString()
    Password: string;
    
    @Field(() => String)
    @IsString()
    Rol: string;
}
