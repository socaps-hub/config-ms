import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosResolver } from './productos.resolver';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { NatsModule } from 'src/transports/nats.module';
import { ProductosHandler } from './productos.handler';

@Module({
  imports: [
    UsuariosModule,
    NatsModule,
  ],
  controllers: [ ProductosHandler ],
  providers: [ProductosResolver, ProductosService],
})
export class ProductosModule {}
