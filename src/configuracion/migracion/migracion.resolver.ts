import { Resolver } from '@nestjs/graphql';
import { MigracionService } from './migracion.service';

@Resolver()
export class MigracionResolver {
  constructor(private readonly migracionService: MigracionService) {}
}
