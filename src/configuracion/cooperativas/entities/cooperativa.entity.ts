import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { Grupo } from 'src/common/entities/grupo.entity';
import { Rubro } from 'src/common/entities/rubro.entity';
import { Producto } from 'src/configuracion/productos/entities/producto.entity';
import { Sucursal } from 'src/configuracion/sucursales/entities/sucursal.entity';
import { Usuario } from 'src/configuracion/usuarios/entities/usuario.entity';

@ObjectType()
export class Cooperativa {

  @Field( () => ID )
  R17Id: string
  
  @Field( () => String )
  R17Nom: string
  
  @Field( () => Boolean )
  R17Activ: boolean
  
  @Field( () => String )
  R17Logo: string
  
  @Field(() => GraphQLISODateTime, { nullable: true })
  R17Creada_en?: Date

  @Field( () => [Sucursal], { nullable: true })
  sucursales?: Sucursal[]
  
  @Field( () => [Usuario], { nullable: true })
  usuarios?: Usuario[]
  
  @Field( () => [Producto], { nullable: true })
  productos?: Producto[]

  @Field( () => [Grupo] , { nullable: true })
  grupos?: Grupo[]

}
