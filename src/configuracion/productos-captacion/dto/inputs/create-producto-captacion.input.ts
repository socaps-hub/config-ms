import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateProductoCaptacionInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  R27Nom: string;

  @Field(() => ID)
  @IsUUID()
  R27Cat_id: string;

  @Field(() => ID)
  @IsUUID()
  R27Coop_id: string;
}
