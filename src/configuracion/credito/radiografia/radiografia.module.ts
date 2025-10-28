import { Module } from '@nestjs/common';
import { RadiografiaService } from './radiografia.service';
import { RadiografiaResolver } from './radiografia.resolver';
import { ControlCargaRadiografiasModule } from '../../control-carga-radiografias/control-carga-radiografias.module';
import { NatsModule } from 'src/transports/nats.module';
import { RadiografiaHandler } from './radiografia.handler';
import { ExcelModule } from 'src/common/excel/excel.module';

@Module({
  imports: [
    NatsModule,
    ControlCargaRadiografiasModule,
    ExcelModule,
  ],
  controllers: [ RadiografiaHandler ],
  providers: [RadiografiaResolver, RadiografiaService],
})
export class RadiografiaModule {}
