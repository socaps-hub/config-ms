import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CooperativasService } from './cooperativas.service';
import { CreateCooperativaInput } from './dto/inputs/create-cooperativa.input';
import { UpdateCooperativaInput } from './dto/inputs/update-cooperativa.input';
import { ValidRoles } from 'src/common/enums/valid-roles.enum';

// LICENCIAMIENTO DTOs
import { AssignCooperativaModuloInput } from './dto/inputs/assign-cooperativa-modulo.input';
import { UpdateCooperativaModuloInput } from './dto/inputs/update-cooperativa-modulo.input';
import { AssignCooperativaSubModuloInput } from './dto/inputs/assign-cooperativa-submodulo.input';
import { UpdateCooperativaSubModuloInput } from './dto/inputs/update-cooperativa-submodulo.input';

@Controller()
export class CooperativasHandler {

    constructor(
        private readonly cooperativasService: CooperativasService
    ) {}

    // ===============================
    // COOPERATIVAS
    // ===============================

    @MessagePattern('config.cooperativas.create')
    handleCreate(
        @Payload() createCooperativaInput: CreateCooperativaInput
    ) {
        return this.cooperativasService.create(createCooperativaInput);
    }

    @MessagePattern('config.cooperativas.getAll')
    handleFindAll(
        @Payload('role') role: ValidRoles
    ) {
        return this.cooperativasService.findAll(role);
    }

    @MessagePattern('config.cooperativas.getAllWithEjecutivos')
    handleFindAllWithEjecutivos() {
        return this.cooperativasService.findAllWithEjecutivos();
    }

    @MessagePattern('config.cooperativas.getById')
    handleFindOne(
        @Payload('id', ParseUUIDPipe) id: string
    ) {
        return this.cooperativasService.findOne(id, true);
    }

    @MessagePattern('config.cooperativas.update')
    handleUpdate(
        @Payload() data: { id: string; updateCooperativaInput: UpdateCooperativaInput }
    ) {
        return this.cooperativasService.update(
            data.id,
            data.updateCooperativaInput
        );
    }

    @MessagePattern('config.cooperativas.activate')
    handleActivate(
        @Payload('name') name: string
    ) {
        return this.cooperativasService.activate(name);
    }

    @MessagePattern('config.cooperativas.desactivate')
    handleDesactivate(
        @Payload('id', ParseUUIDPipe) id: string
    ) {
        return this.cooperativasService.desactivate(id);
    }

    @MessagePattern('config.cooperativas.getCooperativasRadiografiaCreditoStatus')
    handleGetCooperativasRadiografiaCreditoStatus() {
        return this.cooperativasService.getCooperativasRadiografiaCreditoStatus();
    }

    // ===============================
    // LICENCIAMIENTO - MÓDULOS (C02)
    // ===============================

    @MessagePattern('config.cooperativas.modulos.assign')
    handleAssignModuloToCooperativa(
        @Payload() input: AssignCooperativaModuloInput
    ) {
        return this.cooperativasService.assignModuloToCooperativa(input);
    }

    @MessagePattern('config.cooperativas.modulos.update')
    handleUpdateCooperativaModulo(
        @Payload() input: UpdateCooperativaModuloInput
    ) {
        return this.cooperativasService.updateCooperativaModulo(input);
    }

    @MessagePattern('config.cooperativas.modulos.getByCooperativa')
    handleGetModulosByCooperativa(
        @Payload('coopId', ParseUUIDPipe) coopId: string
    ) {
        return this.cooperativasService.getModulosByCooperativa(coopId);
    }

    // ===============================
    // LICENCIAMIENTO - SUBMÓDULOS (C03)
    // ===============================

    @MessagePattern('config.cooperativas.submodulos.assign')
    handleAssignSubModuloToCooperativa(
        @Payload() input: AssignCooperativaSubModuloInput
    ) {
        return this.cooperativasService.assignSubModuloToCooperativa(input);
    }

    @MessagePattern('config.cooperativas.submodulos.update')
    handleUpdateCooperativaSubModulo(
        @Payload() input: UpdateCooperativaSubModuloInput
    ) {
        return this.cooperativasService.updateCooperativaSubModulo(input);
    }
}
