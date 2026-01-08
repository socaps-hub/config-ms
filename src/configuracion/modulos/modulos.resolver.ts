import { Query, Resolver } from '@nestjs/graphql';
import { ModulosService } from './modulos.service';
import { UseGuards } from '@nestjs/common';
import { AuthGraphQLGuard } from 'src/common/guards/auth-graphql.guard';
import { M02ModuloEntity } from './entities/modulo.entity';

@Resolver()
@UseGuards( AuthGraphQLGuard )
export class ModulosResolver {

  constructor(private readonly _modulosService: ModulosService) {}

  @Query(() => [M02ModuloEntity], { name: 'MgetAllModulos' })
  modulos() {
    return this._modulosService.findAllModulos();
  }

}
