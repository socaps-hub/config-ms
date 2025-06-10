import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CooperativasService } from './cooperativas.service';
import { CreateCooperativaInput } from './dto/inputs/create-cooperativa.input';
import { UpdateCooperativaInput } from './dto/inputs/update-cooperativa.input';

@Controller()
export class CooperativasHandler {

    constructor(
        private readonly cooperativasService: CooperativasService
    ) {}

    @MessagePattern('config.cooperativas.create')
    handleCreate(
        @Payload() createCooperativaInput: CreateCooperativaInput
    ) {
        return this.cooperativasService.create( createCooperativaInput );
    }

    @MessagePattern('config.cooperativas.getAll')
    handleFindAll() {
        return this.cooperativasService.findAll();
    }

    @MessagePattern('config.cooperativas.getById')
    handleFindOne(
        @Payload('id', ParseUUIDPipe) id: string
    ) {
        return this.cooperativasService.findOne(id, true);
    }

    @MessagePattern('config.cooperativas.update')
    handleUpdate(
        @Payload() data: { id: string, updateCooperativaInput: UpdateCooperativaInput }
    ) {
        return this.cooperativasService.update( data.id, data.updateCooperativaInput )
    }

    @MessagePattern('config.cooperativas.activate')
    handleActivate(
        @Payload('id', ParseUUIDPipe) id: string
    ) {
        return this.cooperativasService.activate(id)
    }

    @MessagePattern('config.cooperativas.desactivate')
    handledesactivate(
        @Payload('id', ParseUUIDPipe) id: string
    ) {
        return this.cooperativasService.desactivate(id)
    }

    // Puedes agregar create, update, remove si se implementan más adelante.
}
