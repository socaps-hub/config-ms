import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { CategoriasCaptacionService } from './categorias-captacion.service';

@Controller()
export class CategoriasCaptacionHandler {
  constructor(private readonly _service: CategoriasCaptacionService) {}

  @MessagePattern('config.categoriasCaptacion.getAll')
  public findAll() {
    return this._service.findAll();
  }

  @MessagePattern('config.categoriasCaptacion.getById')
  public findOne(
    @Payload('id', ParseUUIDPipe) id: string,
  ) {
    return this._service.findOne(id);
  }
}
