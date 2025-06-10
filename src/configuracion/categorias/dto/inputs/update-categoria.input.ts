import { CreateCategoriaInput } from './create-categoria.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateCategoriaInput extends PartialType(CreateCategoriaInput) {
  @Field(() => Int)
  id: number;
}
