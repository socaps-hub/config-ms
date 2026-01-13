import { Module } from '@nestjs/common';
import { ControlCargaRadiografiasService } from './control-carga-radiografias.service';
import { ControlCargaRadiografiasResolver } from './control-carga-radiografias.resolver';
import { ControlCargaRadiografiasHandler } from './control-carga-radiografias.handler';

@Module({
  providers: [ControlCargaRadiografiasResolver, ControlCargaRadiografiasService],
  controllers: [ ControlCargaRadiografiasHandler ],
  exports: [
    ControlCargaRadiografiasService,
  ]
})
export class ControlCargaRadiografiasModule {}
