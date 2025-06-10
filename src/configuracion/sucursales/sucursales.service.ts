import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { Sucursal } from './entities/sucursal.entity';
import { Usuario } from '../../common/entities/usuario.entity';

@Injectable()
export class SucursalesService extends PrismaClient implements OnModuleInit {

  private readonly _logger = new Logger('SucursalesService')

  // create(createSucursaleInput: CreateSucursaleInput) {
  //   return 'This action adds a new sucursale';
  // }

  async onModuleInit() {
    await this.$connect();
    this._logger.log('Database connected')
  }

  async findAll( user: Usuario ): Promise<Sucursal[]> {
    console.log(user.R12Coop_id);
    
    const sucursal = await this.r11Sucursal.findMany({
      where: {
        R11Coop_id: user.R12Coop_id,
      }
    })

    console.log(sucursal);
    

    return sucursal
  }

  async findOne(id: string, user: Usuario): Promise<Sucursal> {
    const sucursal = await this.r11Sucursal.findFirst({
      where: { R11Id: id, R11Coop_id: user.R12Coop_id }
    })

    if ( !sucursal ) {
      throw new RpcException({
        message: `Sucursal con el id ${ id } no existe`,
        status: HttpStatus.BAD_REQUEST
      })
      // throw new BadRequestException(`Sucursal con el id ${ id } no existe`)
    }

    return sucursal
  }

  // update(id: number, updateSucursaleInput: UpdateSucursaleInput) {
  //   return `This action updates a #${id} sucursale`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} sucursale`;
  // }
}