import { Field, Int, ObjectType } from '@nestjs/graphql';
import { M03SubModuloEntity } from 'src/configuracion/modulos/entities/submodulo.entity';

@ObjectType()
export class CooperativaSubModulo {

  @Field(() => Int)
  C03Id: number;

  @Field(() => Int)
  C03CoopModuloId: number;

  @Field(() => Int)
  C03SubModuloId: number;

  @Field(() => Boolean)
  C03Activo: boolean;

  // =========================
  // RELACIONES
  // =========================

  @Field(() => M03SubModuloEntity, { nullable: true })
  subModulo?: M03SubModuloEntity;

  // =========================
  // AUDITORÍA
  // =========================

//   @Field()
//   createdAt: Date;

//   @Field()
//   updatedAt: Date;
}
