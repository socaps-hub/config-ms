
import { Controller, ParseUUIDPipe, UseInterceptors} from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { Usuario } from "../usuarios/entities/usuario.entity";
import { ProductosService } from "./productos.service";
import { CreateProductoInput } from "./dto/inputs/create-producto.input";
import { UpdateProductoInput } from "./dto/inputs/update-producto.input";
import { CreateProductoImportDto } from "./dto/inputs/create-producto-import.dto";
import { ActivityLog } from "src/common/decorators/activity-log.decorator";
import { AuditActionEnum } from "src/common/enums/audit-action.enum";
import { ActivityLogRpcInterceptor } from "src/common/interceptor/activity-log-rpc.interceptor";
import { AuditSourceEnum } from "src/common/enums/audit-source.enum";

@Controller()
export class ProductosHandler {

    constructor(
        private readonly _service: ProductosService,
    ) {}

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'config-ms',
        module: 'productos',
        action: AuditActionEnum.CREATE,
        eventName: 'config.productos.create',
        entities: [
            { name: 'R13Producto', idPath: 'R13Id' },
        ],
    })
    @MessagePattern('config.productos.create')
    handleCreate(
        @Payload() data: { createProductoInput: CreateProductoInput, user: Usuario }
    ) {
        return this._service.create( data.createProductoInput )
    }

    @MessagePattern('config.productos.getAll')
    handleGetAll(
        @Payload() data: { usuario: Usuario, categoriaId?: string }
    ) {
        return this._service.findAll( data.usuario, data.categoriaId );
    }
    
    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'config-ms',
        module: 'productos',
        action: AuditActionEnum.UPDATE,
        eventName: 'config.productos.update',
        entities: [
            { name: 'R13Producto', idPath: 'R13Id' },
        ],
    })
    @MessagePattern('config.productos.update')
    handleUpdate(
        @Payload() data: { id: string, updateProductoInput: UpdateProductoInput, user: Usuario }
    ) {
        return this._service.update(data.id, data.updateProductoInput);
    }
    
    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'config-ms',
        module: 'productos',
        action: AuditActionEnum.UPDATE,
        eventName: 'config.productos.activate',
        entities: [
            { name: 'R13Producto', idPath: 'R13Id' },
        ],
    })
    @MessagePattern('config.productos.activate')
    handleActivate(
        @Payload() data: { name: string, coopId: string, user: Usuario }
    ) {
        return this._service.activate(data.name, data.coopId);
    }
    
    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'config-ms',
        module: 'productos',
        action: AuditActionEnum.UPDATE,
        eventName: 'config.productos.desactivate',
        entities: [
            { name: 'R13Producto', idPath: 'R13Id' },
        ],
    })
    @MessagePattern('config.productos.desactivate')
    handleDesactivate(
        @Payload() { id }: { id: string, user: Usuario }
    ) {
        return this._service.desactivate(id);
    }

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'config-ms',
        module: 'productos',
        action: AuditActionEnum.UPLOAD,
        source: AuditSourceEnum.JOB,
        eventName: 'config.productos.createManyFromExcel',
        entities: [],
    })
    @MessagePattern('config.productos.createManyFromExcel')
    handleCreateManyFromExcel(
        @Payload() { data, coopId }: { data: CreateProductoImportDto[], coopId: string, user: Usuario }
    ) {
        return this._service.createManyFromExcel( data, coopId );
    }

    
}