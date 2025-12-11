import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Cooperativa } from 'src/configuracion/cooperativas/entities/cooperativa.entity';

@ObjectType()
export class M01ControlMigracion {

  @Field(() => ID)
  M01Id: number;

  @Field(() => String)
  M01Coop_id: string;

  @Field(() => String)
  M01Sistema: string;

  @Field(() => String)
  M01Fase: string;

  @Field(() => String)
  M01Archivo: string;

  @Field(() => String)
  M01Fecha: String;

  @Field(() => Int)
  M01Total: number;

  @Field(() => Int)
  M01Correctos: number;

  @Field(() => Int)
  M01Errores: number;

  @Field(() => String)
  M01Estado: string;

  @Field(() => String, { nullable: true })
  M01Log?: string;
  
  @Field(() => Cooperativa, { nullable: true })
  cooperativa?: Cooperativa
}
