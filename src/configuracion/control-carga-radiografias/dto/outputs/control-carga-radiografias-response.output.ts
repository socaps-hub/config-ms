import { Field, Int, ObjectType } from "@nestjs/graphql";
import { RADIO_AREA } from "@prisma/client";
import { RA01Credito } from "src/configuracion/credito/radiografia/entities/radiografia-credito.entity";
import { RadioAreaEnum } from "../../enums/control-carga-radio-area.enum";

@ObjectType()
export class ControlCargaRadiografiaDto {
    @Field(() => Int)
    C01Id: number;

    @Field(() => String)
    C01CooperativaCodigo: string;

    @Field(() => String)
    C01CooperativaNombre: string;

    @Field(() => String, { nullable: true })
    C01Archivo?: string;

    @Field( () => String)
    C01FechaCarga: String;

    @Field(() => Int)
    C01PeriodoMes: number;
    
    @Field(() => Int)
    C01PeriodoAnio: number;

    @Field(() => RadioAreaEnum)
    C01Area: RADIO_AREA;

    // Relación inversa con RA01Credito
    @Field(() => [RA01Credito], { nullable: true })
    creditos?: RA01Credito[];

    @Field(() => Int)
    totalCreditos: number;

}


@ObjectType()
export class ControlCargaRadiografiasResponse {

    @Field(() => [ControlCargaRadiografiaDto])
    cargas: ControlCargaRadiografiaDto[]

}