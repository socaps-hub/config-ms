import { ArgsType, Field } from '@nestjs/graphql';
import { CreateRA01CreditoInput } from '../inputs/create-radiografia-credito.input';

@ArgsType()
export class CreateRadiografiaCargaArgs {
  @Field(() => String, { description: 'Código de la cooperativa dueña de la carga' })
  cooperativaCodigo: string;

  @Field(() => String, { description: 'Nombre o path del archivo Excel cargado' })
  archivo: string;

  @Field(() => [CreateRA01CreditoInput], { description: 'Listado de créditos convertidos desde el archivo Excel' })
  creditos: CreateRA01CreditoInput[];
}
