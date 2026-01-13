import { Controller, Logger } from "@nestjs/common";
import { EventPattern, MessagePattern, Payload } from "@nestjs/microservices";
import { RadiografiaService } from "./radiografia.service";
import { RadioAreaEnum } from "src/configuracion/control-carga-radiografias/enums/control-carga-radio-area.enum";

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

    @EventPattern('config.radiografias.upload')
    async handleCrearCargaMasivaRadiografia(
        @Payload() { key, cooperativaCodigo, area }: { key: string; cooperativaCodigo: string, area: RadioAreaEnum },
    ) {        
        await this._service.executeCarga(key, cooperativaCodigo, area);
    }


}