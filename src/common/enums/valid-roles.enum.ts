import { registerEnumType } from "@nestjs/graphql";

export enum ValidRoles {

    admin = 'admin',
    ejecutivo = 'ejecutivo',
    supervisor = 'supervisor',
    superUser = 'superUser',
    auditor = 'auditor',
    auditorSelector = 'auditor-selector',
    auditorAdmin = 'auditor-admin',
    operativo = 'operativo',

}

registerEnumType( ValidRoles, { name: 'ValidRoles' } )


