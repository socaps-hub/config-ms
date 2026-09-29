import { registerEnumType } from '@nestjs/graphql';

export enum RadioAreaEnum {
  CREDITO = 'CREDITO',
  CAPTACION = 'CAPTACION',
  AFILIACION = 'AFILIACION',
}


registerEnumType(RadioAreaEnum, {
  name: 'RadioAreaEnum',
});
