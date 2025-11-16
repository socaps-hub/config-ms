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

    /**
   * 📦 Handler que recibe la metadata de carga desde el gateway
   * y procesa el archivo Excel directamente desde el path físico.
   */
    // @MessagePattern('config.radiografias.credito.upload')
    // async handleCrearCargaMasivaRadiografiaCredito(
    //     @Payload()
    //     data: {
    //         cooperativaCodigo: string;
    //         archivo: string;
    //         path: string;
    //     },
    // ) {
    //     const { cooperativaCodigo, archivo, path } = data;

    //     return await this._service.parseFileAndBuildCreateRA01CreditoInput(path, cooperativaCodigo);
    // }

    @EventPattern('config.radiografias.credito.upload')
    async handleCrearCargaMasivaRadiografiaCredito(
        @Payload() { key, cooperativaCodigo }: { key: string; cooperativaCodigo: string },
    ) {
        console.log({key, cooperativaCodigo});
        
        await this._service.parseFileAndBuildCreateRA01CreditoInput(key, cooperativaCodigo);
    }


}