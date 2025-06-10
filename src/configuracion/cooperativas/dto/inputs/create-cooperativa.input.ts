import { InputType, Int, Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class CreateCooperativaInput {
  
  @Field( () => String )
  @IsString()
  R17Nom: string

  @Field( () => String )
  @IsString()
  R17Logo: string

}
