import { registerEnumType } from '@nestjs/graphql';

export enum RadioAreaEnum {
  CREDITO = 'CREDITO',
}


registerEnumType(RadioAreaEnum, {
  name: 'RadioAreaEnum',
});
