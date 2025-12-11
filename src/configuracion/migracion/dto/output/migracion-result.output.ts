import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class MigracionResult {
  @Field(() => Int) total: number;
  @Field(() => Int) correctos: number;
  @Field(() => Int) errores: number;
  @Field(() => Int) controlId: number;
}
