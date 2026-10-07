import { Field, ID, InputType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

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

  @Field(() => Boolean, {
    nullable: true,
    defaultValue: false,
  })
  @IsOptional()
  @IsBoolean()
  R27EsInfantil?: boolean;
}
