import { InputType, Int, Field, ID } from '@nestjs/graphql';
import { IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateProductoInput {
  
  @Field( () => String )
  @IsString()
  R13Nom: string
  
  @Field( () => ID )
  @IsUUID()
  R13Cat_id: string
  
}
