import { InputType, Int, Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class CreateSucursaleInput {

  @Field( () => String )
  @IsString()
  R11NumSuc: string
  
  @Field( () => String )
  @IsString()
  R11Nom: string
  
  @Field( () => String )
  @IsString()
  R11Coop_id: string
  
}
