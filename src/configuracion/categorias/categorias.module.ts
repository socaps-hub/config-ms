import { Module } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CategoriasResolver } from './categorias.resolver';
import { NatsModule } from 'src/transports/nats.module';
import { CategoriasHandler } from './categoria.handler';

@Module({
  imports: [
    NatsModule,
  ],
  controllers: [CategoriasHandler],
  providers: [
    CategoriasResolver, 
    CategoriasService,
  ],
})
export class CategoriasModule {}
