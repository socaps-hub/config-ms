import { Controller, Logger, UseInterceptors } from "@nestjs/common";
import { EventPattern, MessagePattern, Payload } from "@nestjs/microservices";
import { RadiografiaService } from "./radiografia.service";
import { RadioAreaEnum } from "src/configuracion/control-carga-radiografias/enums/control-carga-radio-area.enum";
import { ActivityLog } from "src/common/decorators/activity-log.decorator";
import { AuditActionEnum } from "src/common/enums/audit-action.enum";
import { AuditSourceEnum } from "src/common/enums/audit-source.enum";
import { ActivityLogRpcInterceptor } from "src/common/interceptor/activity-log-rpc.interceptor";
import { Usuario } from "src/configuracion/usuarios/entities/usuario.entity";

@Controller()
export class RadiografiaHandler {

    private readonly logger = new Logger('RadiografiaHandler')

    constructor(
        private readonly _service: RadiografiaService,
    ) { }
    
    @EventPattern('config.radiografias.credito.upload')
    async handleCrearCargaMasivaRadiografiaCredito(
        @Payload() { key, cooperativaCodigo }: { key: string; cooperativaCodigo: string },
    ) {        
        await this._service.parseFileAndBuildCreateRA01CreditoInput(key, cooperativaCodigo);
    }

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'config-ms',
        module: 'credito',
        action: AuditActionEnum.UPLOAD,
        source: AuditSourceEnum.JOB,
        eventName: 'config.radiografias.upload',
        entities: [],
    })
    @EventPattern('config.radiografias.upload')
    async handleCrearCargaMasivaRadiografia(
        @Payload() { key, cooperativaCodigo, area }: { key: string; cooperativaCodigo: string, area: RadioAreaEnum, user: Usuario },
    ) {        
        await this._service.executeCarga(key, cooperativaCodigo, area);
    }


}