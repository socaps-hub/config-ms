import { InputType, Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class CreateCategoriaInput {
  
  @Field( () => String )
  @IsString()
  R14Nom: string

}
