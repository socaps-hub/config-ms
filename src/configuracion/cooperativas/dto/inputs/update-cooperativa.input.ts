import { IsUUID } from 'class-validator';
import { CreateCooperativaInput } from './create-cooperativa.input';
import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateCooperativaInput extends PartialType(CreateCooperativaInput) {

  @Field(() => ID)
  @IsUUID()
  id: string;
  
}

