import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';

import { ProductosService } from './productos.service';
import { Producto } from './entities/producto.entity';
import { GetUserGraphQL } from 'src/common/decorators/user-graphql.decorator';
import { AuthGraphQLGuard } from 'src/common/guards/auth-graphql.guard';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CreateProductoInput } from './dto/inputs/create-producto.input';
import { UpdateProductoInput } from './dto/inputs/update-producto.input';
import { BooleanResponse } from 'src/common/dto/boolean-response.object';
import { CreateProductoImportDto } from './dto/inputs/create-producto-import.dto';
import { CreateManyFromExcelArgs } from './dto/args/create-many-from-excel.arg';

@Resolver(() => Producto)
@UseGuards( AuthGraphQLGuard )
export class ProductosResolver {
  constructor(private readonly productosService: ProductosService) {}

  @Mutation(() => Producto)
  createProducto(
    @Args('createProductoInput') createProductoInput: CreateProductoInput,
    @GetUserGraphQL() user: Usuario
  ) {
    return this.productosService.create(createProductoInput);
  }

  @Query(() => [Producto], { name: 'productos' })
  findAll(
    @GetUserGraphQL() user: Usuario,
    @Args('categoriaId', { type: () => String, nullable: true }) categoriaId?: string,
  ) {
    return this.productosService.findAll(user, categoriaId);
  }

  // @Query(() => Producto, { name: 'producto' })
  // findOne(@Args('id', { type: () => Int }) id: number) {
  //   return this.productosService.findOne(id);
  // }

  @Mutation(() => Producto)
  updateProducto(
    @Args('updateProductoInput') updateProductoInput: UpdateProductoInput,
    @GetUserGraphQL() user: Usuario
  ) {
    return this.productosService.update(updateProductoInput.id, updateProductoInput );
  }

  @Mutation(() => Producto)
  activateProducto(
    @Args('name', { type: () => String }) name: string,
    @Args('coopId', { type: () => String }) coopId: string,
  ) {
    return this.productosService.activate(name, coopId);
  }

  @Mutation(() => Producto)
  desactivateProducto(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string
  ) {
    return this.productosService.desactivate(id);
  }

  @Mutation(() => BooleanResponse)
  createManyFromExcel(
    @Args('createManyFromExcelArgs') createManyFromExcelArgs: CreateManyFromExcelArgs,
  ) {
    return this.productosService.createManyFromExcel(createManyFromExcelArgs.data, createManyFromExcelArgs.coopId);
  }
}