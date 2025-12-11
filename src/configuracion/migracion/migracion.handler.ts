import { Controller } from "@nestjs/common";
import { EventPattern, MessagePattern, Payload } from "@nestjs/microservices";
import { MigracionService } from "./migracion.service";
import { BooleanResponse } from "src/common/dto/boolean-response.object";
import { MigracionRequestInput } from "./dto/input/migracion-request.input";

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

    // ============================================================
    //  MIGRACIÓN SISCONCRE - FASE 1
    // ============================================================
    // @EventPattern('config.migracion.sisconcre.f1')
    // async handleSisconcreF1(
    //     @Payload() data: { key: string; cooperativaId: string }
    // ): Promise<BooleanResponse> {
    //     return await this._service.procesarMigracionF1({
    //         key: data.key,
    //         cooperativaId: data.cooperativaId,
    //         sistema: 'SISCONCRE',
    //         fase: 'F1'
    //     });
    // }

    @EventPattern('config.migracion.sistema')
    async handleSisconcreF1(
        @Payload() { input } : { input: MigracionRequestInput }
    ): Promise<BooleanResponse> {
        return await this._service.ejecutarMigracion(input)
    }

}