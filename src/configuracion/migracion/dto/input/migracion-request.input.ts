import { InputType, Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class MigracionRequestInput {
  
  @Field(() => String)
  @IsString()
  key: string;   // archivo S3
  
  @Field(() => String)
  @IsString()
  cooperativaId: string;
  
  @Field(() => String)
  @IsString()
  sistema: string;
  
  @Field(() => String)
  @IsString()
  fase: string;
}
