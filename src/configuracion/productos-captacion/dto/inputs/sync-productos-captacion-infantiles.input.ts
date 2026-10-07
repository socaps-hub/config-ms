import { ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class SyncProductosCaptacionInfantilesInput {
  @IsUUID()
  coopId: string;

  @IsArray()
  @ArrayUnique()
  @IsUUID('4', {
    each: true,
  })
  productosInfantilesIds: string[];
}
