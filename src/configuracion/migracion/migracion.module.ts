import { Module } from '@nestjs/common';
import { MigracionService } from './migracion.service';
import { MigracionResolver } from './migracion.resolver';
import { MigracionHandler } from './migracion.handler';
import { ExcelModule } from 'src/common/excel/excel.module';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  imports: [
    NatsModule,
    ExcelModule,
  ],
  providers: [MigracionResolver, MigracionService],
  controllers: [ MigracionHandler ],
})
export class MigracionModule {}
