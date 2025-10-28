import { Resolver } from '@nestjs/graphql';
import { ControlCargaRadiografiasService } from './control-carga-radiografias.service';

@Resolver()
export class ControlCargaRadiografiasResolver {
  constructor(private readonly controlCargaRadiografiasService: ControlCargaRadiografiasService) {}
}
