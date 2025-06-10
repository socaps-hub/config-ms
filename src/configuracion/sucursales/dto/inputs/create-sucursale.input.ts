import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateSucursaleInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
