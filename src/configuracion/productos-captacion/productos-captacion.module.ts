import { Module } from '@nestjs/common';
import { ProductosCaptacionService } from './productos-captacion.service';
import { ProductosCaptacionResolver } from './productos-captacion.resolver';
import { ProductosCaptacionHandler } from './productos-captacion.handler';
import { NatsModule } from '../../transports/nats.module';

@Module({
  imports: [NatsModule],
  providers: [ProductosCaptacionResolver, ProductosCaptacionService],
  controllers: [ProductosCaptacionHandler]
})
export class ProductosCaptacionModule {}
