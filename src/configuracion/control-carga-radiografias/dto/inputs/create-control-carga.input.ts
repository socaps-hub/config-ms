import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateC01ControlCargaInput {
  @Field(() => String)
  C01CooperativaCodigo: string;

  @Field(() => String, { nullable: true })
  C01Archivo?: string;
}
