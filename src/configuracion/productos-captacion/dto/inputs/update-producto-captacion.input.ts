import { Field, ID, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

@InputType()
export class UpdateProductoCaptacionInput {
  @Field(() => String, {
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  R27Nom?: string;

  @Field(() => ID, {
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  R27Cat_id?: string;

  @Field(() => Boolean, {
    nullable: true,
  })
  @IsOptional()
  @IsBoolean()
  R27EsInfantil?: boolean;
}
