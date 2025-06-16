import { Module } from '@nestjs/common';
import { CooperativasModule } from './cooperativas/cooperativas.module';
import { SucursalesModule } from './sucursales/sucursales.module';
import { CategoriasModule } from './categorias/categorias.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ProductosModule } from './productos/productos.module';

@Module({
  imports: [
    CooperativasModule, 
    SucursalesModule, 
    CategoriasModule, 
    UsuariosModule, ProductosModule,
  ]
})
export class ConfiguracionModule {}
