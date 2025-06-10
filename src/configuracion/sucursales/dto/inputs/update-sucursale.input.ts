
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateSucursaleInput } from './create-sucursale.input';

@InputType()
export class UpdateSucursaleInput extends PartialType(CreateSucursaleInput) {
  @Field(() => Int)
  id: number;
}
