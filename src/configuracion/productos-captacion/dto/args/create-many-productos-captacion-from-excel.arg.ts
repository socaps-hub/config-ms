import { Field, ID, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';

import { IsArray, IsUUID, ValidateNested } from 'class-validator';

import { CreateProductoCaptacionImportDto } from '../inputs/create-producto-captacion-import.dto';

@InputType()
export class CreateManyProductosCaptacionFromExcelArgs {
  @Field(() => [CreateProductoCaptacionImportDto])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductoCaptacionImportDto)
  data: CreateProductoCaptacionImportDto[];

  @Field(() => ID)
  @IsUUID()
  coopId: string;
}
