import { IsUUID } from 'class-validator';
import { CreateUsuarioInput } from './create-usuario.input';
import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateUsuarioInput extends PartialType(CreateUsuarioInput) {

  @Field(() => ID)
  @IsUUID()
  id: string;
  
}
