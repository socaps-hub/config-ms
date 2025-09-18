import { registerEnumType } from "@nestjs/graphql";

export enum GrupoTipo {
  SISCONCRE = 'SISCONCRE',
  SISCONCAP = 'SISCONCAP'
}

registerEnumType(GrupoTipo, { name: 'GrupoTipo' });
