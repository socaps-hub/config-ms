import { Field, ID, ObjectType } from '@nestjs/graphql';

import { CategoriaCaptacion } from '../../categorias-captacion/entities/categoria-captacion.entity';

@ObjectType()
export class ProductoCaptacion {
  @Field(() => ID)
  R27Id: string;

  @Field(() => String)
  R27Nom: string;

  @Field(() => ID)
  R27Cat_id: string;

  @Field(() => Boolean)
  R27Activ: boolean;

  @Field(() => Boolean)
  R27EsInfantil: boolean;

  @Field(() => ID)
  R27Coop_id: string;

  @Field(() => CategoriaCaptacion, { nullable: true })
  categoria?: CategoriaCaptacion;
}
