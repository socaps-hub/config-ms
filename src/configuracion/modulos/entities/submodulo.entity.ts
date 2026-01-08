import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType('SubModulo')
export class M03SubModuloEntity {
  @Field(() => Int)
  M03Id: number;

  @Field(() => String)
  M03Codigo: string;

  @Field(() => String)
  M03Nombre: string;

  @Field(() => Int, { nullable: true })
  M03Orden: number|null;

  @Field(() => Boolean)
  M03Activo: boolean;

  @Field(() => Int)
  M03ModuloId: number;

//   @Field()
//   createdAt: Date;

//   @Field()
//   updatedAt: Date;
}
