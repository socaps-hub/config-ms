import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosResolver } from './usuarios.resolver';
import { UsuariosHandler } from './usuarios.handler';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  imports: [
    NatsModule
  ],
  controllers: [ UsuariosHandler ],
  providers: [UsuariosResolver, UsuariosService],
  exports: [
    UsuariosService,
  ]
})
export class UsuariosModule {}
