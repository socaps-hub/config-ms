import { Controller, ParseUUIDPipe, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { ActivityLog } from 'src/common/decorators/activity-log.decorator';
import { AuditActionEnum } from 'src/common/enums/audit-action.enum';
import { AuditSourceEnum } from 'src/common/enums/audit-source.enum';
import { ActivityLogRpcInterceptor } from 'src/common/interceptor/activity-log-rpc.interceptor';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CreateProductoCaptacionInput } from './dto/inputs/create-producto-captacion.input';
import { UpdateProductoCaptacionInput } from './dto/inputs/update-producto-captacion.input';
import { CreateProductoCaptacionImportDto } from './dto/inputs/create-producto-captacion-import.dto';
import { ProductosCaptacionService } from './productos-captacion.service';
import { SyncProductosCaptacionInfantilesInput } from './dto/inputs/sync-productos-captacion-infantiles.input';

@Controller()
export class ProductosCaptacionHandler {
  constructor(private readonly _service: ProductosCaptacionService) {}

  // ============================================================
  // CREATE
  // ============================================================

  @UseInterceptors(ActivityLogRpcInterceptor)
  @ActivityLog({
    service: 'config-ms',
    module: 'productos-captacion',
    action: AuditActionEnum.CREATE,
    eventName: 'config.productosCaptacion.create',
    entities: [
      {
        name: 'R27ProductoCaptacion',
        idPath: 'R27Id',
      },
    ],
  })
  @MessagePattern('config.productosCaptacion.create')
  public handleCreate(
    @Payload()
    data: {
      createProductoCaptacionInput: CreateProductoCaptacionInput;
      user: Usuario;
    },
  ) {
    return this._service.create(data.createProductoCaptacionInput);
  }

  // ============================================================
  // GET ALL
  // ============================================================

  @MessagePattern('config.productosCaptacion.getAll')
  public handleGetAll(
    @Payload()
    data: {
      coopId: string;
      categoriaId?: string;
      user: Usuario;
    },
  ) {
    return this._service.findAll(data.coopId, data.categoriaId);
  }

  // ============================================================
  // GET BY ID
  // ============================================================

  @MessagePattern('config.productosCaptacion.getById')
  public handleGetById(
    @Payload('id', ParseUUIDPipe)
    id: string,

    @Payload('coopId', ParseUUIDPipe)
    coopId: string,
  ) {
    return this._service.findByID(id, coopId);
  }

  // ============================================================
  // UPDATE
  // ============================================================

  @UseInterceptors(ActivityLogRpcInterceptor)
  @ActivityLog({
    service: 'config-ms',
    module: 'productos-captacion',
    action: AuditActionEnum.UPDATE,
    eventName: 'config.productosCaptacion.update',
    entities: [
      {
        name: 'R27ProductoCaptacion',
        idPath: 'R27Id',
      },
    ],
  })
  @MessagePattern('config.productosCaptacion.update')
  public handleUpdate(
    @Payload()
    data: {
      id: string;
      coopId: string;
      updateProductoCaptacionInput: UpdateProductoCaptacionInput;
      user: Usuario;
    },
  ) {
    return this._service.update(
      data.id,
      data.coopId,
      data.updateProductoCaptacionInput,
    );
  }

  // ============================================================
  // ACTIVATE
  // ============================================================

  @UseInterceptors(ActivityLogRpcInterceptor)
  @ActivityLog({
    service: 'config-ms',
    module: 'productos-captacion',
    action: AuditActionEnum.UPDATE,
    eventName: 'config.productosCaptacion.activate',
    entities: [
      {
        name: 'R27ProductoCaptacion',
        idPath: 'R27Id',
      },
    ],
  })
  @MessagePattern('config.productosCaptacion.activate')
  public handleActivate(
    @Payload()
    data: {
      name: string;
      coopId: string;
      user: Usuario;
    },
  ) {
    return this._service.activate(data.name, data.coopId);
  }

  // ============================================================
  // DESACTIVATE
  // ============================================================

  @UseInterceptors(ActivityLogRpcInterceptor)
  @ActivityLog({
    service: 'config-ms',
    module: 'productos-captacion',
    action: AuditActionEnum.UPDATE,
    eventName: 'config.productosCaptacion.desactivate',
    entities: [
      {
        name: 'R27ProductoCaptacion',
        idPath: 'R27Id',
      },
    ],
  })
  @MessagePattern('config.productosCaptacion.desactivate')
  public handleDesactivate(
    @Payload()
    data: {
      id: string;
      coopId: string;
      user: Usuario;
    },
  ) {
    return this._service.desactivate(data.id, data.coopId);
  }

  @UseInterceptors(ActivityLogRpcInterceptor)
  @ActivityLog({
    service: 'config-ms',
    module: 'productos-captacion',
    action: AuditActionEnum.UPDATE,
    eventName: 'config.productosCaptacion.syncInfantiles',
    entities: [],
  })
  @MessagePattern('config.productosCaptacion.syncInfantiles')
  public handleSyncInfantiles(
    @Payload()
    data: {
      input: SyncProductosCaptacionInfantilesInput;
      user: Usuario;
    },
  ) {
    return this._service.syncInfantiles(data.input);
  }

  // ============================================================
  // CREATE MANY FROM EXCEL
  // ============================================================

  @UseInterceptors(ActivityLogRpcInterceptor)
  @ActivityLog({
    service: 'config-ms',
    module: 'productos-captacion',
    action: AuditActionEnum.UPLOAD,
    source: AuditSourceEnum.JOB,
    eventName: 'config.productosCaptacion.createManyFromExcel',
    entities: [],
  })
  @MessagePattern('config.productosCaptacion.createManyFromExcel')
  public handleCreateManyFromExcel(
    @Payload()
    data: {
      data: CreateProductoCaptacionImportDto[];
      coopId: string;
      user: Usuario;
    },
  ) {
    return this._service.createManyFromExcel(data.data, data.coopId);
  }
}
