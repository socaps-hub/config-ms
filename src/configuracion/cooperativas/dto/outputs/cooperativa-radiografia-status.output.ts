import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class CooperativaRadiografiaStatus {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  nombre: string;

  @Field(() => Boolean)
  tieneCarga: boolean;
}
