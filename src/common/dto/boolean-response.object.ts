// src/common/dto/boolean-response.object.ts
import { Field, ObjectType } from '@nestjs/graphql';
import { MigracionResult } from 'src/configuracion/migracion/dto/output/migracion-result.output';

@ObjectType()
export class BooleanResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String , { nullable: true })
  message?: string;

  @Field(() => MigracionResult, { nullable: true })
  data?: MigracionResult;
}
