import { Controller } from "@nestjs/common";
import { ModulosService } from "./modulos.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { CreateModuloInput } from "./dto/create-modulo.input";
import { UpdateModuloInput } from "./dto/update-modulo.input";
import { CreateSubModuloInput } from "./dto/create-submodulo.input";
import { UpdateSubModuloInput } from "./dto/update-submodulo.input";

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

    @MessagePattern('config.modulos.createModulo')
    handleCreateModulo(
        @Payload() { input }: { input: CreateModuloInput }
    ) {
        return this._service.createModulo(input)
    }

    @MessagePattern('config.modulos.updateModulo')
    handleUpdateModulo(
        @Payload() { input }: { input: UpdateModuloInput }
    ) {
        return this._service.updateModulo(input)
    }

    @MessagePattern('config.modulos.desactivateModulo')
    handleDesactivateModulo(
        @Payload() { id }: { id: number }
    ) {
        return this._service.desactivateModulo(id)
    }

    @MessagePattern('config.modulos.activateModulo')
    handleActivateModulo(
        @Payload() { id }: { id: number }
    ) {
        return this._service.activateModulo(id)
    }

    // ============================
    //* SUBMÓDULOS
    // ============================
    @MessagePattern('config.submodulos.createSubModulo')
    handleCreateSubModulo(
        @Payload() { input }: { input: CreateSubModuloInput }
    ) {
        return this._service.createSubModulo(input)
    }

    @MessagePattern('config.modulos.findSubModuloById')
    handleGetSubModuloById(
        @Payload() { id }: { id: number }
    ) {
        return this._service.findSubModuloById(id)
    }

    @MessagePattern('config.modulos.updateSubModulo')
    handleUpdateSubModulo(
        @Payload() { id, input }: { id: number, input: UpdateSubModuloInput }
    ) {
        return this._service.updateSubModulo(input)
    }

    @MessagePattern('config.modulos.desactivateSubModulo')
    handleDesactivateSubModulo(
        @Payload() { id }: { id: number }
    ) {
        return this._service.desactivateSubModulo(id)
    }

    @MessagePattern('config.modulos.activateSubModulo')
    handleActivateSubModulo(
        @Payload() { id }: { id: number }
    ) {
        return this._service.activateSubModulo(id)
    }

}