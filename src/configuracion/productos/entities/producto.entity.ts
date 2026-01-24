import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Categoria } from 'src/configuracion/categorias/entities/categoria.entity';

@ObjectType()
export class Producto {
  
  @Field( () => String )
  R13Id: string
  
  @Field( () => String )
  R13Nom: string
  
  @Field( () => ID )
  R13Cat_id: string
  
  @Field( () => Boolean )
  R13Activ: boolean
  
  @Field( () => String )
  R13Coop_id: string

  @Field( () => Categoria, { nullable: true })
  categoria?: Categoria


}
