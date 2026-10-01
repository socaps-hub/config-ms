import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CategoriaCaptacion {
  @Field(() => ID)
  R26Id: string;

  @Field(() => String)
  R26Nom: string;

  @Field(() => Boolean)
  R26Activ: boolean;
}
