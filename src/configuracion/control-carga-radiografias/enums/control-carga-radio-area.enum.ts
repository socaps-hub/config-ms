import { registerEnumType } from '@nestjs/graphql';

export enum RadioAreaEnum {
  CREDITO = 'CREDITO',
  CAPTACION = 'CAPTACION',
}


registerEnumType(RadioAreaEnum, {
  name: 'RadioAreaEnum',
});
