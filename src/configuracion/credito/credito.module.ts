import { Module } from '@nestjs/common';
import { RadiografiaModule } from './radiografia/radiografia.module';

@Module({
  imports: [RadiografiaModule]
})
export class CreditoModule {}
