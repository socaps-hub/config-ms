import { Controller, Logger } from "@nestjs/common";
import { EventPattern, MessagePattern, Payload } from "@nestjs/microservices";
import { RadiografiaService } from "./radiografia.service";
import { CreateRadiografiaCargaArgs } from "./dto/args/create-radiografia-carga.arg";
import { FileUpload } from "graphql-upload-ts";

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


}