import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateProductoCaptacionImportDto {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  Nombre: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  Categoria: string;
}
