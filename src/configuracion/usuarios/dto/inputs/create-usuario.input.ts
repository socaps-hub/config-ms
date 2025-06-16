import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';
import { ValidRoles } from 'src/common/enums/valid-roles.enum';

@InputType()
export class CreateUsuarioInput {

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  R12Ni: string
  
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  R12Nom: string

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  R12Password: string
  
  @Field(() => ValidRoles )
  @IsString()
  R12Rol: string 

  @Field(() => ID)
  @IsUUID()
  R12Suc_id: string

  @Field(() => ID)
  @IsUUID()
  R12Coop_id: string

}
