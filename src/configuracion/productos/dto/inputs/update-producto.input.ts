import { IsUUID } from 'class-validator';
import { CreateProductoInput } from './create-producto.input';
import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateProductoInput extends PartialType(CreateProductoInput) {

  @Field(() => ID)
  @IsUUID()
  id: string;

}
