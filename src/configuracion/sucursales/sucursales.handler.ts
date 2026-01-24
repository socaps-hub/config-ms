import { Controller, ParseUUIDPipe, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SucursalesService } from './sucursales.service';
import { CreateSucursaleInput } from './dto/inputs/create-sucursale.input';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UpdateSucursalInput } from './dto/inputs/update-sucursale.input';
import { CreateSucursalImportDto } from './dto/inputs/create-sucursal-import.dto';
import { ActivityLog } from 'src/common/decorators/activity-log.decorator';
import { AuditActionEnum } from 'src/common/enums/audit-action.enum';
import { ActivityLogRpcInterceptor } from 'src/common/interceptor/activity-log-rpc.interceptor';
import { AuditSourceEnum } from 'src/common/enums/audit-source.enum';

@Controller()
export class SucursalesHandler {

  constructor(
    private readonly sucursalesService: SucursalesService
  ) {}

  @UseInterceptors(ActivityLogRpcInterceptor)
  @ActivityLog({
      service: 'config-ms',
      module: 'sucursales',
      action: AuditActionEnum.CREATE,
      eventName: 'config.sucursales.create',
      entities: [
          { name: 'R11Sucursal', idPath: 'R11Id' },
      ],
  })
  @MessagePattern('config.sucursales.create')
  handleCreate(
    @Payload() data: {createSucursalInput: CreateSucursaleInput, user: Usuario}
  ) {
    return this.sucursalesService.create( data.createSucursalInput, data.user )
  }

  @MessagePattern('config.sucursales.getAll')
  handleFindAll(
    @Payload('user') user: Usuario
  ) {
    return this.sucursalesService.findAll(user);
  }

  @MessagePattern('config.sucursales.getAllByCoopId')
  handleFindAllByCoopId(
    @Payload('id', ParseUUIDPipe) id: string
  ) {
    return this.sucursalesService.findAllByCoopId(id);
  }

  @MessagePattern('config.sucursales.getById')
  handleFindOne(
    @Payload() data: { id: string, user: Usuario }
  ) {
    return this.sucursalesService.findOne(data.id, data.user);
  }

  @UseInterceptors(ActivityLogRpcInterceptor)
  @ActivityLog({
      service: 'config-ms',
      module: 'sucursales',
      action: AuditActionEnum.UPDATE,
      eventName: 'config.sucursales.update',
      entities: [
          { name: 'R11Sucursal', idPath: 'R11Id' },
      ],
  })
  @MessagePattern('config.sucursales.update')
  handleUpdate(
    @Payload() { updateSucursalInput }: { updateSucursalInput: UpdateSucursalInput, user: Usuario }
  ) {
    return this.sucursalesService.update( updateSucursalInput.id, updateSucursalInput );
  }

  @UseInterceptors(ActivityLogRpcInterceptor)
  @ActivityLog({
    service: 'config-ms',
    module: 'sucursales',
    action: AuditActionEnum.UPLOAD,
    source: AuditSourceEnum.JOB,
    eventName: 'config.sucursales.createManyFromExcel',
    entities: [],
  })
  @MessagePattern('config.sucursales.createManyFromExcel')
  handleCreateManyFromExcel(
    @Payload() { data, coopId }: { data: CreateSucursalImportDto[], coopId: string, user: Usuario }
  ) {
    return this.sucursalesService.createManyFromExcel( data, coopId );
  }

  // Puedes agregar `create`, `update` y `remove` cuando estén disponibles
}
