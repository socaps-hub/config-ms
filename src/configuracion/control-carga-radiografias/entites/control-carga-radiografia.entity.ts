import { ObjectType, Field, Int } from '@nestjs/graphql';
import { RA01Credito } from 'src/configuracion/credito/radiografia/entities/radiografia-credito.entity';

@ObjectType()
export class C01ControlCarga {
    @Field(() => Int)
    C01Id: number;

    @Field(() => String)
    C01CooperativaCodigo: string;

    @Field(() => String, { nullable: true })
    C01Archivo?: string;

    @Field( () => Date)
    C01FechaCarga: Date;

    @Field(() => Int)
    C01PeriodoMes: number;
    
    @Field(() => Int)
    C01PeriodoAnio: number;

    // Relación inversa con RA01Credito
    @Field(() => [RA01Credito], { nullable: true })
    creditos?: RA01Credito[];
}
