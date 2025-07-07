import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class ChangePasswordInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @Field(() => String)
  @IsString()
  @MinLength(6)
  newPassword: string;
}
