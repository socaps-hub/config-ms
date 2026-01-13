import { Controller } from "@nestjs/common";
import { ControlCargaRadiografiasService } from "./control-carga-radiografias.service";
import { MessagePattern } from "@nestjs/microservices";

@Controller()
export class ControlCargaRadiografiasHandler {

    constructor(
        private readonly _service: ControlCargaRadiografiasService,
    ) { }

    @MessagePattern('control-carga-radios.getAll')
    handleGetAll() {
        return this._service.getAll()
    }

}