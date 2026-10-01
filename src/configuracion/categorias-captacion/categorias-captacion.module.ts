import { Module } from '@nestjs/common';
import { CategoriasCaptacionService } from './categorias-captacion.service';
import { CategoriasCaptacionResolver } from './categorias-captacion.resolver';
import { CategoriasCaptacionHandler } from './categorias-captacion.handler';

@Module({
  providers: [CategoriasCaptacionResolver, CategoriasCaptacionService],
  controllers: [CategoriasCaptacionHandler],
  exports: [CategoriasCaptacionService],
})
export class CategoriasCaptacionModule {}
