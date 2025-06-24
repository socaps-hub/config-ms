
import { Controller, ParseUUIDPipe} from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { Usuario } from "../usuarios/entities/usuario.entity";
import { ProductosService } from "./productos.service";
import { CreateProductoInput } from "./dto/inputs/create-producto.input";
import { UpdateProductoInput } from "./dto/inputs/update-producto.input";

@Controller()
export class ProductosHandler {

    constructor(
        private readonly _service: ProductosService,
    ) {}

    @MessagePattern('config.productos.create')
    handleCreate(
        @Payload() data: { createProductoInput: CreateProductoInput }
    ) {
        return this._service.create( data.createProductoInput )
    }

    @MessagePattern('config.productos.getAll')
    handleGetAll(
        @Payload() data: { usuario: Usuario, categoriaId?: string }
    ) {
        return this._service.findAll( data.usuario, data.categoriaId );
    }
    
    @MessagePattern('config.productos.update')
    handleUpdate(
        @Payload() data: { id: string, updateProductoInput: UpdateProductoInput }
    ) {
        return this._service.update(data.id, data.updateProductoInput);
    }
    
    @MessagePattern('config.productos.activate')
    handleActivate(
        @Payload() data: { name: string, coopId: string }
    ) {
        return this._service.activate(data.name, data.coopId);
    }
    
    @MessagePattern('config.productos.desactivate')
    handleDesactivate(
        @Payload('id', ParseUUIDPipe) id: string
    ) {
        return this._service.desactivate(id);
    }

    
}