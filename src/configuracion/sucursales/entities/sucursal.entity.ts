import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Sucursal {

  @Field( () => ID )
  R11Id: string;

  @Field( () => String )
  R11NumSuc: string;
  
  @Field( () => String )
  R11Nom: string;
  
}
