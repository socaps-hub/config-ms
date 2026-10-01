import { Resolver } from '@nestjs/graphql';
import { ProductosCaptacionService } from './productos-captacion.service';

@Resolver()
export class ProductosCaptacionResolver {
  constructor(private readonly productosCaptacionService: ProductosCaptacionService) {}
}
