import { Module } from '@nestjs/common';
import { CooperativasModule } from './cooperativas/cooperativas.module';
import { SucursalesModule } from './sucursales/sucursales.module';
import { CategoriasModule } from './categorias/categorias.module';

@Module({
  imports: [
    CooperativasModule, 
    SucursalesModule, CategoriasModule
  ]
})
export class ConfiguracionModule {}
