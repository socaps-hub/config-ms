import { registerEnumType } from "@nestjs/graphql";

export enum GrupoTipo {
  SISCONCRE = 'SISCONCRE',
  SISCONCAP = 'SISCONCAP',

  //* AUDITORIA
  // Credito
  ACREDITO = 'ACREDITO',
}

registerEnumType(GrupoTipo, { name: 'GrupoTipo' });
