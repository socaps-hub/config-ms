import { Controller, UseInterceptors } from "@nestjs/common";
import { EventPattern, MessagePattern, Payload } from "@nestjs/microservices";
import { MigracionService } from "./migracion.service";
import { BooleanResponse } from "src/common/dto/boolean-response.object";
import { MigracionRequestInput } from "./dto/input/migracion-request.input";
import { ActivityLog } from "src/common/decorators/activity-log.decorator";
import { AuditActionEnum } from "src/common/enums/audit-action.enum";
import { AuditSourceEnum } from "src/common/enums/audit-source.enum";
import { ActivityLogRpcInterceptor } from "src/common/interceptor/activity-log-rpc.interceptor";
import { Usuario } from "../usuarios/entities/usuario.entity";

@Controller()
export class MigracionHandler {

    constructor(
        private readonly _service: MigracionService,
    ) { }

    // ============================================================
    //  LISTADO DE CONTROL DE MIGRACION
    // ============================================================
    @MessagePattern('config.migracion.getAllControlMigrations')
    async handleGetAllControlMigrations() {
        return await this._service.getAllControlMigrations()
    }

    @MessagePattern('config.migracion.getControlMigrationById')
    async handleGetControlMigrationById(
        @Payload() { id }: { id: number }
    ) {
        return await this._service.getControlMigrationById( id )
    }
    
    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'config-ms',
        module: 'migracion',
        action: AuditActionEnum.UPLOAD,
        source: AuditSourceEnum.JOB,
        eventName: 'config.migracion.sistema',
        entities: [],
    })
    @EventPattern('config.migracion.sistema')
    async handleSisconcreF1(
        @Payload() { input } : { input: MigracionRequestInput, user: Usuario }
    ): Promise<BooleanResponse> {
        return await this._service.ejecutarMigracion(input)
    }

}