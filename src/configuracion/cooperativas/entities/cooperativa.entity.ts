import { ObjectType, Field, ID } from '@nestjs/graphql';
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
  
  @Field( () => Date )
  R17Creada_en: Date

  @Field( () => [Sucursal])
  sucursales: Sucursal[]
  
  @Field( () => [Usuario])
  usuarios: Usuario[]
  
  @Field( () => [Producto])
  productos: Producto[]

}
