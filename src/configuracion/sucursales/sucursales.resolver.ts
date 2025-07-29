import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { SucursalesService } from './sucursales.service';
import { Sucursal } from './entities/sucursal.entity';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { GetUserGraphQL } from 'src/common/decorators/user-graphql.decorator';
import { AuthGraphQLGuard } from 'src/common/guards/auth-graphql.guard';
import { CreateSucursaleInput } from './dto/inputs/create-sucursale.input';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UpdateSucursalInput } from './dto/inputs/update-sucursale.input';
import { BooleanResponse } from 'src/common/dto/boolean-response.object';
import { CreateManySucursalesFromExcelArgs } from './dto/args/create-many-from-excel.arg';

@Resolver(() => Sucursal)
@UseGuards( AuthGraphQLGuard )
export class SucursalesResolver {

  constructor(private readonly sucursalesService: SucursalesService) {}

  @Mutation(() => Sucursal)
  createSucursal(
    @Args('createSucursalInput') createSucursalInput: CreateSucursaleInput,
    @GetUserGraphQL() user: Usuario
  ) {
    return this.sucursalesService.create(createSucursalInput, user);
  }

  @Query(() => [Sucursal], { name: 'sucursales' })
  findAll(
    @GetUserGraphQL() user: Usuario
  ) {
    return this.sucursalesService.findAll( user );
  }

  @Query(() => [Sucursal], { name: 'sucursalesByCoopId' })
  findAllByCoopId(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ) {
    
    return this.sucursalesService.findAllByCoopId( id );
  }

  @Query(() => Sucursal, { name: 'sucursal' })
  findOne(
    @Args('id', { type: () => ID }) id: string,
    @GetUserGraphQL() user: Usuario
  ) {
    return this.sucursalesService.findOne(id, user);
  }

  @Mutation(() => Sucursal)
  updateSucursal(
    @Args('updateSucursaleInput') updateSucursalInput: UpdateSucursalInput
  ) {
    return this.sucursalesService.update(updateSucursalInput.id, updateSucursalInput);
  }

  @Mutation(() => BooleanResponse)
  createManyFromExcel(
    @Args('createManyFromExcelArgs') createManyFromExcelArgs: CreateManySucursalesFromExcelArgs,
  ) {
    return this.sucursalesService.createManyFromExcel(createManyFromExcelArgs.data, createManyFromExcelArgs.coopId);
  }

  // @Mutation(() => Sucursal)
  // removeSucursal(@Args('id', { type: () => ID }, ParseUUIDPipe) id: string) {
  //   return this.sucursalesService.remove(id);
  // }
}