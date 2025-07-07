import { Controller, ParseUUIDPipe } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";

import { UsuariosService } from "../usuarios/usuarios.service";
import { Usuario } from "../usuarios/entities/usuario.entity";
import { CreateUsuarioInput } from "../usuarios/dto/inputs/create-usuario.input";
import { UpdateUsuarioInput } from "./dto/inputs/update-usuario.input";
import { ValidRoles } from "src/common/enums/valid-roles.enum";
import { ChangePasswordInput } from "./dto/inputs/change-password.input";

@Controller()
export class UsuariosHandler {

    constructor(
        private readonly _usuariosService: UsuariosService
    ) { }

    @MessagePattern('config.usuarios.create')
    handleCreateUsuario(
        @Payload() data: { createUsuarioInput: CreateUsuarioInput },
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

    @MessagePattern('config.usuarios.update')
    handleUpdateUsuario(
        @Payload() updateUsuarioInput: UpdateUsuarioInput
    ) {
        return this._usuariosService.update( updateUsuarioInput.id, updateUsuarioInput );
    }
    
    @MessagePattern('config.usuarios.desactivate')
    handleDesactivateUser(
        @Payload('id', ParseUUIDPipe) id: string
    ) {
        return this._usuariosService.desactivate(id);
    }

    @MessagePattern('config.usuarios.activate')
    handleActivateUser(
        @Payload('userNI') userNI: string
    ) {
        return this._usuariosService.activate(userNI.toUpperCase());
    }

    @MessagePattern('config.usuarios.changePassword')
    handleChangePassword(
        @Payload() data: { input: ChangePasswordInput, user: Usuario }
    ) {
        return this._usuariosService.changePassword( data.input, data.user )
    }
}