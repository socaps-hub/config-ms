import { ObjectType, Field, Int } from '@nestjs/graphql';
import { M03SubModuloEntity } from './submodulo.entity';

@ObjectType('Modulo')
export class M02ModuloEntity {
  @Field(() => Int)
  M02Id: number;

  @Field(() => String)
  M02Codigo: string;

  @Field(() => String)
  M02Nombre: string;

  @Field(() => Int, { nullable: true })
  M02Orden: number|null;

  @Field(() => Boolean)
  M02Activo: boolean;

  @Field(() => [M03SubModuloEntity], { nullable: true })
  submodulos?: M03SubModuloEntity[];

//   @Field()
//   createdAt: Date;

//   @Field()
//   updatedAt: Date;
}
