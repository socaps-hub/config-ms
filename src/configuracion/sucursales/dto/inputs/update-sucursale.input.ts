
import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';
import { CreateSucursaleInput } from './create-sucursale.input';
import { IsUUID } from 'class-validator';

@InputType()
export class UpdateSucursalInput extends PartialType(CreateSucursaleInput) {

  @Field(() => ID)
  @IsUUID()
  id: string;

}
