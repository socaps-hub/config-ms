import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Sucursal } from '../../configuracion/sucursales/entities/sucursal.entity';

@ObjectType()
export class Usuario {

  @Field( () => String)
  R12Id: string
  
  @Field( () => String)
  R12Ni: string
  
  @Field( () => String)
  R12Nom: string
  
  R12Password: string
  
  @Field( () => String)
  R12Suc_id: string
  
  @Field( () => String)
  R12Rol: string
  
  @Field( () => Boolean)
  R12Activ: boolean
  
  @Field( () => Date)
  R12Creado_en: Date

  R12Coop_id: string

  @Field( () => Sucursal )
  sucursal: Sucursal
}
