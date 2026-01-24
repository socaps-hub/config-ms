import { Controller, UseInterceptors } from "@nestjs/common";
import { ModulosService } from "./modulos.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { CreateModuloInput } from "./dto/create-modulo.input";
import { UpdateModuloInput } from "./dto/update-modulo.input";
import { CreateSubModuloInput } from "./dto/create-submodulo.input";
import { UpdateSubModuloInput } from "./dto/update-submodulo.input";
import { ActivityLog } from "src/common/decorators/activity-log.decorator";
import { AuditActionEnum } from "src/common/enums/audit-action.enum";
import { ActivityLogRpcInterceptor } from "src/common/interceptor/activity-log-rpc.interceptor";
import { Usuario } from "../usuarios/entities/usuario.entity";

@Controller()
export class ModulosHandler {

    constructor(
        private readonly _service: ModulosService,
    ) { }

    @MessagePattern('config.modulos.getAllModulos')
    handleGetAllModulos() {
        return this._service.findAllModulos()
    }

    @MessagePattern('config.modulos.getModuloById')
    handleGetModuloById(
        @Payload() { id }: { id: number }
    ) {
        return this._service.findModuloById(id)
    }

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'config-ms',
        module: 'cooperativas',
        action: AuditActionEnum.CREATE,
        eventName: 'config.modulos.createModulo',
        entities: [
            { name: 'M02Modulo', idPath: 'M02Id' },
        ],
    })
    @MessagePattern('config.modulos.createModulo')
    handleCreateModulo(
        @Payload() { input }: { input: CreateModuloInput, user: Usuario }
    ) {
        return this._service.createModulo(input)
    }

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'config-ms',
        module: 'cooperativas',
        action: AuditActionEnum.UPDATE,
        eventName: 'config.modulos.updateModulo',
        entities: [
            { name: 'M02Modulo', idPath: 'M02Id' },
        ],
    })
    @MessagePattern('config.modulos.updateModulo')
    handleUpdateModulo(
        @Payload() { input }: { input: UpdateModuloInput, user: Usuario }
    ) {
        return this._service.updateModulo(input)
    }

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'config-ms',
        module: 'cooperativas',
        action: AuditActionEnum.UPDATE,
        eventName: 'config.modulos.desactivateModulo',
        entities: [
            { name: 'M02Modulo', idPath: 'M02Id' },
        ],
    })
    @MessagePattern('config.modulos.desactivateModulo')
    handleDesactivateModulo(
        @Payload() { id }: { id: number, user: Usuario }
    ) {
        return this._service.desactivateModulo(id)
    }

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'config-ms',
        module: 'cooperativas',
        action: AuditActionEnum.UPDATE,
        eventName: 'config.modulos.activateModulo',
        entities: [
            { name: 'M02Modulo', idPath: 'M02Id' },
        ],
    })
    @MessagePattern('config.modulos.activateModulo')
    handleActivateModulo(
        @Payload() { id }: { id: number, user: Usuario }
    ) {
        return this._service.activateModulo(id)
    }

    // ============================
    //* SUBMÓDULOS
    // ============================

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'config-ms',
        module: 'cooperativas',
        action: AuditActionEnum.CREATE,
        eventName: 'config.modulos.createSubModulo',
        entities: [
            { name: 'M03SubModulo', idPath: 'M03Id' },
        ],
    })
    @MessagePattern('config.submodulos.createSubModulo')
    handleCreateSubModulo(
        @Payload() { input }: { input: CreateSubModuloInput, user: Usuario }
    ) {
        return this._service.createSubModulo(input)
    }

    @MessagePattern('config.modulos.findSubModuloById')
    handleGetSubModuloById(
        @Payload() { id }: { id: number }
    ) {
        return this._service.findSubModuloById(id)
    }

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'config-ms',
        module: 'cooperativas',
        action: AuditActionEnum.UPDATE,
        eventName: 'config.modulos.updateSubModulo',
        entities: [
            { name: 'M03SubModulo', idPath: 'M03Id' },
        ],
    })
    @MessagePattern('config.modulos.updateSubModulo')
    handleUpdateSubModulo(
        @Payload() { input }: { input: UpdateSubModuloInput, user: Usuario }
    ) {
        return this._service.updateSubModulo(input)
    }

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'config-ms',
        module: 'cooperativas',
        action: AuditActionEnum.UPDATE,
        eventName: 'config.modulos.desactivateSubModulo',
        entities: [
            { name: 'M03SubModulo', idPath: 'M03Id' },
        ],
    })
    @MessagePattern('config.modulos.desactivateSubModulo')
    handleDesactivateSubModulo(
        @Payload() { id }: { id: number, user: Usuario }
    ) {
        return this._service.desactivateSubModulo(id)
    }

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'config-ms',
        module: 'cooperativas',
        action: AuditActionEnum.UPDATE,
        eventName: 'config.modulos.activateSubModulo',
        entities: [
            { name: 'M03SubModulo', idPath: 'M03Id' },
        ],
    })
    @MessagePattern('config.modulos.activateSubModulo')
    handleActivateSubModulo(
        @Payload() { id }: { id: number, user: Usuario }
    ) {
        return this._service.activateSubModulo(id)
    }

}