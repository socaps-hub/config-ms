import { ObjectType, Field, Int, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { Rubro } from './rubro.entity';

@ObjectType()
export class Elemento {
  
  @Field( () => ID)
  R04Id: string

  @Field( () => ID)
  R04R_id: string

  @Field( () => String)
  R04Nom: string

  @Field( () => String)
  R04Imp: String

  @Field( () => Int)
  R04Pond: number;

  @Field(() => GraphQLISODateTime, { nullable: true })
  R04Creado_en?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  R04Actualizado_en?: Date;

  @Field( () => Rubro, { nullable: true })
  rubro?: Rubro

  
}
