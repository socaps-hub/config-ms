import { Controller, Logger, ParseUUIDPipe, UseInterceptors } from '@nestjs/common';
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
import { ActivityLog } from 'src/common/decorators/activity-log.decorator';
import { AuditActionEnum } from 'src/common/enums/audit-action.enum';
import { ActivityLogRpcInterceptor } from 'src/common/interceptor/activity-log-rpc.interceptor';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Controller()
export class CooperativasHandler {
    private readonly logger = new Logger('Cooperativas Handler');

    constructor(
        private readonly cooperativasService: CooperativasService
    ) {}

    // ===============================
    // COOPERATIVAS
    // ===============================

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'config-ms',
        module: 'cooperativas',
        action: AuditActionEnum.CREATE,
        eventName: 'config.cooperativas.create',
        entities: [
            { name: 'R17Cooperativas', idPath: 'R17Id' },
        ],
    })
    @MessagePattern('config.cooperativas.create')
    handleCreate(
        @Payload() { createCooperativaInput }:{ createCooperativaInput: CreateCooperativaInput, user: Usuario }
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

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'config-ms',
        module: 'cooperativas',
        action: AuditActionEnum.UPDATE,
        eventName: 'config.cooperativas.update',
        entities: [
            { name: 'R17Cooperativas', idPath: 'R17Id' },
        ],
    })
    @MessagePattern('config.cooperativas.update')
    handleUpdate(
        @Payload() { id, updateCooperativaInput, user }: { id: string; updateCooperativaInput: UpdateCooperativaInput, user: Usuario }
    ) {
        return this.cooperativasService.update(
            id,
            updateCooperativaInput,
        );
    }

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'config-ms',
        module: 'cooperativas',
        action: AuditActionEnum.UPDATE,
        eventName: 'config.cooperativas.activate',
        entities: [
            { name: 'R17Cooperativas', idPath: 'R17Id' },
        ],
    })
    @MessagePattern('config.cooperativas.activate')
    handleActivate(
        @Payload() { name }: { name: string, user: Usuario }
    ) {
        return this.cooperativasService.activate(name);
    }

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'config-ms',
        module: 'cooperativas',
        action: AuditActionEnum.DELETE,
        eventName: 'config.cooperativas.desactivate',
        entities: [
            { name: 'R17Cooperativas', idPath: 'R17Id' },
        ],
    })
    @MessagePattern('config.cooperativas.desactivate')
    handleDelete(
        @Payload() { id, user }: { id: string, user: Usuario }
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

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'config-ms',
        module: 'cooperativas',
        action: AuditActionEnum.ASSIGN,
        eventName: 'config.cooperativas.modulos.assign',
        entities: [
            { name: 'C02CooperativaModulo', idPath: 'C02Id' },
        ],
    })
    @MessagePattern('config.cooperativas.modulos.assign')
    handleAssignModuloToCooperativa(
        @Payload() {input, user}: { input: AssignCooperativaModuloInput, user: Usuario }
    ) {
        return this.cooperativasService.assignModuloToCooperativa(input);
    }

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'config-ms',
        module: 'cooperativas',
        action: AuditActionEnum.UPDATE,
        eventName: 'config.cooperativas.modulos.update',
        entities: [
            { name: 'C02CooperativaModulo', idPath: 'C02Id' },
        ],
    })
    @MessagePattern('config.cooperativas.modulos.update')
    handleUpdateCooperativaModulo(
        @Payload() { input, user }: { input: UpdateCooperativaModuloInput, user: Usuario }
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

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'config-ms',
        module: 'cooperativas',
        action: AuditActionEnum.ASSIGN,
        eventName: 'config.cooperativas.submodulos.assign',
        entities: [
            { name: 'C03CooperativaSubModulo', idPath: 'C03Id' },
        ],
    })
    @MessagePattern('config.cooperativas.submodulos.assign')
    handleAssignSubModuloToCooperativa(
        @Payload() { input, user }: { input: AssignCooperativaSubModuloInput, user: Usuario }
    ) {
        return this.cooperativasService.assignSubModuloToCooperativa(input);
    }

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'config-ms',
        module: 'cooperativas',
        action: AuditActionEnum.UPDATE,
        eventName: 'config.cooperativas.submodulos.update',
        entities: [
            { name: 'C03CooperativaSubModulo', idPath: 'C03Id' },
        ],
    })
    @MessagePattern('config.cooperativas.submodulos.update')
    handleUpdateCooperativaSubModulo(
        @Payload() { input, user }: { input: UpdateCooperativaSubModuloInput, user: Usuario }
    ) {
        return this.cooperativasService.updateCooperativaSubModulo(input);
    }
}
