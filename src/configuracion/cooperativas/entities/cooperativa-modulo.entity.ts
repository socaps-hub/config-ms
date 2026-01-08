import { Field, Int, ObjectType } from '@nestjs/graphql';
import { CooperativaSubModulo } from './cooperativa-submodulo.entity';
import { M02ModuloEntity } from 'src/configuracion/modulos/entities/modulo.entity';

@ObjectType()
export class CooperativaModulo {

  @Field(() => Int)
  C02Id: number;

  @Field(() => String)
  C02CoopId: string;

  @Field(() => Int)
  C02ModuloId: number;

  @Field(() => Boolean)
  C02Activo: boolean;

  @Field(() => Date, { nullable: true })
  C02FechaInicio: Date|null;

  @Field(() => Date, { nullable: true })
  C02FechaFin: Date|null;

  // =========================
  // RELACIONES
  // =========================

  @Field(() => M02ModuloEntity, { nullable: true })
  modulo?: M02ModuloEntity;

  @Field(() => [CooperativaSubModulo], { nullable: true })
  submodulos?: CooperativaSubModulo[];

  // =========================
  // AUDITORÍA
  // =========================

//   @Field()
//   createdAt: Date;

//   @Field()
//   updatedAt: Date;
}
