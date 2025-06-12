import { Module } from '@nestjs/common';
import { CooperativasService } from './cooperativas.service';
import { CooperativasResolver } from './cooperativas.resolver';
import { CooperativasHandler } from './cooperativas.handler';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  imports: [
    NatsModule
  ],
  controllers: [
    CooperativasHandler
  ],
  providers: [CooperativasResolver, CooperativasService],
})
export class CooperativasModule {}
