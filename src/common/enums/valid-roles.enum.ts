import { registerEnumType } from "@nestjs/graphql";

export enum ValidRoles {

    admin = 'admin',
    ejecutivo = 'ejecutivo',
    supervisor = 'supervisor',
    superUser = 'superUser',
    auditor = 'auditor',

}

registerEnumType( ValidRoles, { name: 'ValidRoles' } )


