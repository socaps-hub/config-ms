import { BadRequestException, HttpStatus, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';

import { CreateUsuarioInput } from './dto/inputs/create-usuario.input';
import { Usuario } from './entities/usuario.entity';
import { bcryptAdapter } from 'src/config';
import { UpdateUsuarioInput } from './dto/inputs/update-usuario.input';
import { ValidRoles } from 'src/common/enums/valid-roles.enum';

@Injectable()
export class UsuariosService extends PrismaClient implements OnModuleInit {

  private readonly _logger = new Logger('SucursalesService')
  
  async onModuleInit() {
    await this.$connect();
    this._logger.log('Database connected')
  }
  
  // create(createSucursaleInput: CreateSucursaleInput) {
  //   return 'This action adds a new sucursale';
  // }

  async findAll( role: ValidRoles, user: Usuario ): Promise<Usuario[]> {

    if ( user.R12Rol === ValidRoles.admin ) {
      return await this.r12Usuario.findMany({
        orderBy: {
          R12Creado_en: 'desc'
        },
        where: { 
          R12Rol: role,
          R12Coop_id: user.R12Coop_id, 
          R12Activ: true 
        },
        include: {
          sucursal: true
        }
      })
    }

    return await this.r12Usuario.findMany({
      orderBy: {
        R12Creado_en: 'desc'
      },
      where: { 
        R12Rol: role, 
        R12Suc_id: user.R12Suc_id,
        R12Coop_id: user.R12Coop_id, 
        R12Activ: true 
      },
      include: {
        sucursal: true
      }
    })
  }

  async create(createUsuarioInput: CreateUsuarioInput) {

      const { R12Ni, R12Password, R12Coop_id } = createUsuarioInput
  
      const userDB = await await this.r12Usuario.findFirst({
        where: { R12Ni: R12Ni.trim() },
      })
  
      if ( userDB ) {

        if ( !userDB.R12Activ ) {
          console.log(userDB.R12Rol);
          
          throw new RpcException({
            message: `${ userDB.R12Rol.toUpperCase() } con clave ${ R12Ni } -> ${ userDB.R12Nom } esta desactivado`,
            status: HttpStatus.BAD_REQUEST
          })
          // throw new BadRequestException(`${ userDB.R12Rol.toUpperCase() } con clave ${ R12Ni } -> ${ userDB.R12Nom } esta desactivado`)
        }

        throw new RpcException({
          message: `Usuario con clave ${ R12Ni } ya existe`,
          status: HttpStatus.BAD_REQUEST
        })
        // throw new BadRequestException(`Usuario con clave ${ R12Ni } ya existe`)
      }
  
      return this.r12Usuario.create({
        data: {
          ...createUsuarioInput,
          R12Coop_id,
          R12Password: bcryptAdapter.hash(R12Password)
        },
        include: {
          sucursal: true
        }
      })

  }

  async findByNI( userNI: string, withSucursales: boolean = false ): Promise<Usuario> {
    
    const user = await this.r12Usuario.findFirst({
      where: { R12Ni: userNI },
      include: {
        sucursal: withSucursales
      }
    })

    if ( !user || !user.R12Activ ) {
      throw new RpcException({
        message: `Usuario con clave ${ userNI } no existe`,
        status: HttpStatus.NOT_FOUND
      })
      // throw new NotFoundException(`Usuario con clave ${ userNI } no existe`)
    }

    return user
  }

  async findByID( id: string ) {
    
    const user = await this.r12Usuario.findFirst({
      where: { R12Id: id },
      include: {
        sucursal: {
          select: { R11Nom: true, R11NumSuc: true }
        }
      }
    })

    if ( !user || !user.R12Activ ) {
      throw new RpcException({
        message: `Usuario con id ${ id } no existe`,
        status: HttpStatus.NOT_FOUND
      })
      // throw new NotFoundException(`Usuario con id ${ id } no existe`)
    }

    return user
  }

  async update( id: string, updateUsuarioInput: UpdateUsuarioInput ) {

    const { R12Suc_id, R12Ni, R12Nom, R12Password } = updateUsuarioInput

    console.log(R12Password);
    
    
    if ( R12Ni ) {
      
      const user = await this.findByNI( R12Ni )
      
      
      if (user && user.R12Id !== id) {
        throw new RpcException({
          message: `El usuario con clave ${ R12Ni } ya existe en tu cooperativa`,
          status: HttpStatus.BAD_REQUEST
        })
        // throw new BadRequestException(`El producto ${ R13Nom } ya existe en tu cooperativa`)
      }
    }
    
    const userDB = await this.findByID( id )    
    return await this.r12Usuario.update({
      where: { R12Id: id },
      data: {
        R12Id: userDB.R12Id,
        R12Suc_id: R12Suc_id ? R12Suc_id : userDB.R12Suc_id,
        R12Ni: R12Ni ? R12Ni : userDB.R12Ni,
        R12Nom: R12Nom ? R12Nom : userDB.R12Nom,
        R12Password: R12Password && R12Password !== 'xxxxxx' ? bcryptAdapter.hash(R12Password) : userDB.R12Password,
        R12Rol: userDB.R12Rol,
        R12Activ: userDB.R12Activ,
        R12Coop_id: userDB.R12Coop_id,
      },
      include: {
        sucursal: true
      }
    })

  }

  async activate( userNI: string ) {

    const user = await this.r12Usuario.findFirst({
      where: { R12Ni: userNI },
      include: {
        sucursal: true
      }
    })

    if ( !user ) {
      throw new RpcException({
        message: `Usuario con clave ${ userNI } no existe`,
        status: HttpStatus.NOT_FOUND
      })
      // throw new NotFoundException(`Usuario con clave ${ userNI } no existe`)
    }

    user.R12Activ = true

    return this.r12Usuario.update({
      where: { R12Ni: userNI },
      data: {
        R12Id: user.R12Id,
        R12Ni: user.R12Ni,
        R12Password: user.R12Password,
        R12Nom: user.R12Nom,
        R12Suc_id: user.R12Suc_id,
        R12Rol: user.R12Rol,
        R12Activ: user.R12Activ,
        R12Creado_en: user.R12Creado_en,
        R12Coop_id: user.R12Coop_id,
      },
      include: {
        sucursal: true
      }
    })

  }

  async desactivate( id: string ) {

    const user = await this.findByID( id )
    user.R12Activ = false

    return this.r12Usuario.update({
      where: { R12Id: id },
      data: {
        R12Id: user.R12Id,
        R12Ni: user.R12Ni,
        R12Password: user.R12Password,
        R12Nom: user.R12Nom,
        R12Suc_id: user.R12Suc_id,
        R12Rol: user.R12Rol,
        R12Activ: user.R12Activ,
        R12Creado_en: user.R12Creado_en,
        R12Coop_id: user.R12Coop_id,
      },
      include: {
        sucursal: true
      }
    })

  }

}