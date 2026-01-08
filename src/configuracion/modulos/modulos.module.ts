import { Module } from '@nestjs/common';
import { ModulosService } from './modulos.service';
import { ModulosResolver } from './modulos.resolver';
import { NatsModule } from 'src/transports/nats.module';
import { ModulosHandler } from './modulos.handler';

@Module({
  imports: [
    NatsModule,
  ],
  controllers: [ ModulosHandler ],
  providers: [ModulosResolver, ModulosService],
})
export class ModulosModule {}
