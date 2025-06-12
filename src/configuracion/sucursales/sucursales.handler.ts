import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SucursalesService } from './sucursales.service';
import { Usuario } from '../../common/entities/usuario.entity';
import { CreateSucursaleInput } from './dto/inputs/create-sucursale.input';

@Controller()
export class SucursalesHandler {

  constructor(
    private readonly sucursalesService: SucursalesService
  ) {}

  @MessagePattern('config.sucursales.create')
  handleCreate(
    @Payload() data: {createSucursalInput: CreateSucursaleInput, user: Usuario}
  ) {
    return this.sucursalesService.create( data.createSucursalInput, data.user )
  }

  @MessagePattern('config.sucursales.getAll')
  handleFindAll(
    @Payload('user') user: Usuario
  ) {
    return this.sucursalesService.findAll(user);
  }

  @MessagePattern('config.sucursales.getAllByCoopId')
  handleFindAllByCoopId(
    @Payload('id', ParseUUIDPipe) id: string
  ) {
    return this.sucursalesService.findAllByCoopId(id);
  }

  @MessagePattern('config.sucursales.getById')
  handleFindOne(
    @Payload() data: { id: string, user: Usuario }
  ) {
    return this.sucursalesService.findOne(data.id, data.user);
  }

  // Puedes agregar `create`, `update` y `remove` cuando estén disponibles
}
