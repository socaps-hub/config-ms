import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { RadiografiaService } from './radiografia.service';
import { UseGuards } from '@nestjs/common';
import { AuthGraphQLGuard } from 'src/common/guards/auth-graphql.guard';
import { CreateRadiografiaCargaArgs } from './dto/args/create-radiografia-carga.arg';
import { BooleanResponse } from 'src/common/dto/boolean-response.object';

@Resolver()
@UseGuards(AuthGraphQLGuard)
export class RadiografiaResolver {

  constructor(private readonly radiografiaService: RadiografiaService) {}

  @Mutation(() => BooleanResponse, { name: 'crearCargaMasivaRadiografiaCredito' })
  async crearCargaMasivaRadiografiaCredito(
    @Args() args: CreateRadiografiaCargaArgs,
  ): Promise<BooleanResponse> {
    const { cooperativaCodigo, archivo, creditos } = args;

    try {
      const result = await this.radiografiaService.crearCargaMasivaRadiografiaCredito(
        cooperativaCodigo,
        archivo,
        creditos,
      );

      return {
        success: true,
        message: `Carga completada correctamente. Se insertaron ${result.totalRegistros} créditos (controlId: ${result.controlId}).`,
      };
    } catch (error) {
      console.error('❌ Error al crear la carga masiva de radiografía:', error);
      return {
        success: false,
        message: `Error al crear la carga: ${error.message}`,
      };
    }
  }

}
