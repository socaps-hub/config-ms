import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';

import { UsuariosService } from './usuarios.service';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioInput } from './dto/inputs/create-usuario.input';
import { ValidRolesArgs } from './dto/args/roles.arg';
import { GetUserGraphQL } from 'src/common/decorators/user-graphql.decorator';
import { AuthGraphQLGuard } from 'src/common/guards/auth-graphql.guard';
import { UpdateUsuarioInput } from './dto/inputs/update-usuario.input';

@Resolver(() => Usuario)
@UseGuards( AuthGraphQLGuard )
export class UsuariosResolver {

  constructor(private readonly usuariosService: UsuariosService) {}

  @Mutation(() => Usuario)
  createUsuario(
    @Args('createUsuarioInput') createUsuarioInput: CreateUsuarioInput,
  ) {
    return this.usuariosService.create(createUsuarioInput);
  }

  @Query(() => [Usuario], { name: 'usuarios' })
  findAll(
    @Args() validRoles: ValidRolesArgs,
    @GetUserGraphQL() user: Usuario,
  ) {
    return this.usuariosService.findAll( validRoles.role, user );
  }

  @Query(() => Usuario, { name: 'usuario' })
  findByNI(
    @Args('ni', { type: () => String }) ni: string
  ) {
    return this.usuariosService.findByNI(ni, true);
  }

  @Mutation(() => Usuario)
  updateUsuario(
    @Args('updateUsuarioInput') updateUsuarioInput: UpdateUsuarioInput
  ) {
    return this.usuariosService.update(updateUsuarioInput.id, updateUsuarioInput);
  }

  @Mutation(() => Usuario)
  desactivateUser(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string) {
    return this.usuariosService.desactivate(id);
  }

  @Mutation(() => Usuario)
  activateUser(
    @Args('userNI', { type: () => String }) userNI: string) {
    return this.usuariosService.activate(userNI.toUpperCase());
  }
}