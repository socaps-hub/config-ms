import { Resolver } from '@nestjs/graphql';
import { CategoriasCaptacionService } from './categorias-captacion.service';

@Resolver()
export class CategoriasCaptacionResolver {
  constructor(private readonly categoriasCaptacionService: CategoriasCaptacionService) {}
}
