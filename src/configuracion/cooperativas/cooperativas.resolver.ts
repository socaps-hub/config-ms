import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { CooperativasService } from './cooperativas.service';
import { Cooperativa } from './entities/cooperativa.entity';
import { ParseUUIDPipe } from '@nestjs/common';
import { CreateCooperativaInput } from './dto/inputs/create-cooperativa.input';
import { UpdateCooperativaInput } from './dto/inputs/update-cooperativa.input';

@Resolver(() => Cooperativa)
export class CooperativasResolver {

  constructor(
    private readonly cooperativasService: CooperativasService
  ) {}

  @Mutation(() => Cooperativa)
  createCooperativa(
    @Args('createCooperativaInput') createCooperativaInput: CreateCooperativaInput
  ) {
    return this.cooperativasService.create(createCooperativaInput);
  }

  @Query(() => [Cooperativa], { name: 'cooperativas' })
  findAll() {
    return this.cooperativasService.findAll();
  }

  @Query(() => Cooperativa, { name: 'cooperativa' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe ) id: string
  ) {
    return this.cooperativasService.findOne(id);
  }

  @Mutation(() => Cooperativa)
  updateCooperativa(
    @Args('updateCooperativaInput') updateCooperativaInput: UpdateCooperativaInput
  ) {
    return this.cooperativasService.update(updateCooperativaInput.id, updateCooperativaInput);
  }

  @Mutation(() => Cooperativa)
  activateCooperativa(
    @Args('name', { type: () => String }) name: string
  ) {
    return this.cooperativasService.activate(name);
  }

  @Mutation(() => Cooperativa)
  desactivateCooperativa(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string
  ) {
    return this.cooperativasService.desactivate(id);
  }
}