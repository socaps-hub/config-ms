import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaInput } from './dto/inputs/create-categoria.input';
import { Usuario } from '../../common/entities/usuario.entity';

@Controller()
export class CategoriasHandler {
  constructor(
    private readonly categoriasService: CategoriasService
  ) {
    console.log('🟢 CategoriasHandler instanciado');
  }

  @MessagePattern('config.categorias.create')
  handleCreate(
    @Payload() data: { createCategoriaInput: CreateCategoriaInput, user: Usuario }
  ) {
    return this.categoriasService.create(data.createCategoriaInput, data.user);
  }

  @MessagePattern('config.categorias.getAll')
  handleFindAll() {
    return this.categoriasService.findAll();
  }

  @MessagePattern('config.categorias.getById')
  handleFindOne(
    @Payload('id', ParseUUIDPipe) id: string
  ) {
    return this.categoriasService.findOne(id);
  }

  // Puedes agregar update/delete cuando estén implementados
}
