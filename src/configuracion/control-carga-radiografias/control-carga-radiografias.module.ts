import { Module } from '@nestjs/common';
import { ControlCargaRadiografiasService } from './control-carga-radiografias.service';
import { ControlCargaRadiografiasResolver } from './control-carga-radiografias.resolver';

@Module({
  providers: [ControlCargaRadiografiasResolver, ControlCargaRadiografiasService],
  exports: [
    ControlCargaRadiografiasService,
  ]
})
export class ControlCargaRadiografiasModule {}
