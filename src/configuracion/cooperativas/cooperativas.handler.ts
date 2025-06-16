import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CooperativasService } from './cooperativas.service';
import { CreateCooperativaInput } from './dto/inputs/create-cooperativa.input';
import { UpdateCooperativaInput } from './dto/inputs/update-cooperativa.input';
import { ValidRoles } from 'src/common/enums/valid-roles.enum';

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
    handleFindAll(
        @Payload('role') role: ValidRoles
    ) {
        return this.cooperativasService.findAll( role );
    }

    @MessagePattern('config.cooperativas.getAllWithEjecutivos')
    handleFindAllWithEjecutivos() {
        return this.cooperativasService.findAllWithEjecutivos();
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
        @Payload('name') name: string
    ) {
        return this.cooperativasService.activate(name)
    }

    @MessagePattern('config.cooperativas.desactivate')
    handledesactivate(
        @Payload('id', ParseUUIDPipe) id: string
    ) {
        return this.cooperativasService.desactivate(id)
    }

    // Puedes agregar create, update, remove si se implementan más adelante.
}
