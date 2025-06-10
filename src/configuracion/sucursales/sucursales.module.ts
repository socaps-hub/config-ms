import { Module } from '@nestjs/common';
import { SucursalesService } from './sucursales.service';
import { SucursalesResolver } from './sucursales.resolver';
import { NatsModule } from 'src/transports/nats.module';
import { SucursalesHandler } from './sucursales.handler';

@Module({
  imports: [
    NatsModule,
  ],
  controllers: [SucursalesHandler],
  providers: [SucursalesResolver, SucursalesService],
})
export class SucursalesModule {}
