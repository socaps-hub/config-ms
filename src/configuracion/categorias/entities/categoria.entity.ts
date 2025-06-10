import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Categoria {
  
  @Field( () => String )
  R14Id: string
  
  @Field( () => String )
  R14Nom: string
  
  @Field( () => Boolean )
  R14Activ: boolean

}
