import { Module } from '@nestjs/common';
import { CooperativasModule } from './cooperativas/cooperativas.module';
import { SucursalesModule } from './sucursales/sucursales.module';
import { CategoriasModule } from './categorias/categorias.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ProductosModule } from './productos/productos.module';
import { CreditoModule } from './credito/credito.module';
import { ControlCargaRadiografiasModule } from './control-carga-radiografias/control-carga-radiografias.module';
import { MigracionModule } from './migracion/migracion.module';

@Module({
  imports: [
    CooperativasModule, 
    SucursalesModule, 
    CategoriasModule, 
    UsuariosModule, 
    ProductosModule, 
    CreditoModule, 
    ControlCargaRadiografiasModule, MigracionModule,
  ]
})
export class ConfiguracionModule {}
