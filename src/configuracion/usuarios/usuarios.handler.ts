import { Controller, ParseUUIDPipe, UseInterceptors } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";

import { UsuariosService } from "../usuarios/usuarios.service";
import { Usuario } from "../usuarios/entities/usuario.entity";
import { CreateUsuarioInput } from "../usuarios/dto/inputs/create-usuario.input";
import { UpdateUsuarioInput } from "./dto/inputs/update-usuario.input";
import { ValidRoles } from "src/common/enums/valid-roles.enum";
import { ChangePasswordInput } from "./dto/inputs/change-password.input";
import { CreateUsuarioImportDto } from "./dto/inputs/create-usuario-import.dto";
import { ActivityLog } from "src/common/decorators/activity-log.decorator";
import { AuditActionEnum } from "src/common/enums/audit-action.enum";
import { ActivityLogRpcInterceptor } from "src/common/interceptor/activity-log-rpc.interceptor";
import { AuditSourceEnum } from "src/common/enums/audit-source.enum";

@Controller()
export class UsuariosHandler {

    constructor(
        private readonly _usuariosService: UsuariosService
    ) { }

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'config-ms',
        module: 'usuarios',
        action: AuditActionEnum.CREATE,
        eventName: 'config.usuarios.create',
        entities: [
            { name: 'R12Usuario', idPath: 'R12Id' },
        ],
    })
    @MessagePattern('config.usuarios.create')
    handleCreateUsuario(
        @Payload() data: { createUsuarioInput: CreateUsuarioInput, user: Usuario },
    ) {
        return this._usuariosService.create( data.createUsuarioInput );
    }

    @MessagePattern('config.usuarios.getAll')
    handleGetAll(
        @Payload() data: { role: ValidRoles, user: Usuario }
    ) {
        return this._usuariosService.findAll( data.role, data.user );
    }

    @MessagePattern('config.usuarios.getByNI')
    handleGetByNI(
        @Payload() data : { ni: string, withSucursales: boolean }
    ) {
        return this._usuariosService.findByNI(data.ni.toUpperCase(), data.withSucursales);
    }

    @MessagePattern('config.usuarios.getByID')
    handleGetByID(
        @Payload('id', ParseUUIDPipe) id: string
    ) {
        return this._usuariosService.findByID(id);
    }

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'config-ms',
        module: 'usuarios',
        action: AuditActionEnum.UPDATE,
        eventName: 'config.usuarios.update',
        entities: [
            { name: 'R12Usuario', idPath: 'R12Id' },
        ],
    })
    @MessagePattern('config.usuarios.update')
    handleUpdateUsuario(
        @Payload() { updateUsuarioInput }: { updateUsuarioInput: UpdateUsuarioInput, user: Usuario }
    ) {
        return this._usuariosService.update( updateUsuarioInput.id, updateUsuarioInput );
    }
    
    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'config-ms',
        module: 'usuarios',
        action: AuditActionEnum.UPDATE,
        eventName: 'config.usuarios.desactivate',
        entities: [
            { name: 'R12Usuario', idPath: 'R12Id' },
        ],
    })
    @MessagePattern('config.usuarios.desactivate')
    handleDesactivateUser(
        @Payload() { id }: { id: string, user: Usuario }
    ) {
        return this._usuariosService.desactivate(id);
    }

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'config-ms',
        module: 'usuarios',
        action: AuditActionEnum.UPDATE,
        eventName: 'config.usuarios.activate',
        entities: [
            { name: 'R12Usuario', idPath: 'R12Id' },
        ],
    })
    @MessagePattern('config.usuarios.activate')
    handleActivateUser(
        @Payload() { userNI }: { userNI: string, user: Usuario }
    ) {
        return this._usuariosService.activate(userNI.toUpperCase());
    }

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'config-ms',
        module: 'usuarios',
        action: AuditActionEnum.UPDATE,
        eventName: 'config.usuarios.changePassword',
        operationName: 'CHANGE_PASSWORD',
        entities: [
            { name: 'R12Usuario', idPath: 'R12Id' },
        ],
    })
    @MessagePattern('config.usuarios.changePassword')
    handleChangePassword(
        @Payload() data: { input: ChangePasswordInput, user: Usuario }
    ) {
        return this._usuariosService.changePassword( data.input, data.user )
    }

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'config-ms',
        module: 'usuarios',
        action: AuditActionEnum.UPLOAD,
        source: AuditSourceEnum.JOB,
        eventName: 'config.usuarios.createManyFromExcel',
        entities: [],
    })
    @MessagePattern('config.usuarios.createManyFromExcel')
    handleCreateManyFromExcel(
        @Payload() { data, coopId }: { data: CreateUsuarioImportDto[], coopId: string, user: Usuario }
    ) {
        return this._usuariosService.createManyFromExcel( data, coopId )
    }
}