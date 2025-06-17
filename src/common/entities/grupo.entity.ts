import { ObjectType, Field } from '@nestjs/graphql';
import { Cooperativa } from 'src/configuracion/cooperativas/entities/cooperativa.entity';

@ObjectType()
export class Grupo {
 
  @Field( () => String )
  R02Id: string
  
  @Field( () => String )
  R02Nom: string
  
  // @Field( () => String )
  R02Coop_id: string
  
  @Field( () => Date )
  R02Creado_en: Date
  
  @Field( () => Date )
  R02Actualizado_en: Date
  
  // @Field( () => Cooperativa )
  // cooperativa: Cooperativa

  // rubros: 

}
