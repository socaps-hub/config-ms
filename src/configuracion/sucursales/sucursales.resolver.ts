import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { SucursalesService } from './sucursales.service';
import { Sucursal } from './entities/sucursal.entity';
import { UseGuards } from '@nestjs/common';
import { GetUserGraphQL } from 'src/common/decorators/user-graphql.decorator';
import { AuthGraphQLGuard } from 'src/common/guards/auth-graphql.guard';
import { Usuario } from '../../common/entities/usuario.entity';

@Resolver(() => Sucursal)
@UseGuards( AuthGraphQLGuard )
export class SucursalesResolver {

  constructor(private readonly sucursalesService: SucursalesService) {}

  // @Mutation(() => Sucursale)
  // createSucursale(@Args('createSucursaleInput') createSucursaleInput: CreateSucursaleInput) {
  //   return this.sucursalesService.create(createSucursaleInput);
  // }

  @Query(() => [Sucursal], { name: 'sucursales' })
  findAll(
    @GetUserGraphQL() user: Usuario
  ) {
    console.log(user);
    
    return this.sucursalesService.findAll( user );
  }

  @Query(() => Sucursal, { name: 'sucursal' })
  findOne(
    @Args('id', { type: () => ID }) id: string,
    @GetUserGraphQL() user: Usuario
  ) {
    return this.sucursalesService.findOne(id, user);
  }

  // @Mutation(() => Sucursale)
  // updateSucursale(@Args('updateSucursaleInput') updateSucursaleInput: UpdateSucursaleInput) {
  //   return this.sucursalesService.update(updateSucursaleInput.id, updateSucursaleInput);
  // }

  // @Mutation(() => Sucursale)
  // removeSucursale(@Args('id', { type: () => Int }) id: number) {
  //   return this.sucursalesService.remove(id);
  // }
}