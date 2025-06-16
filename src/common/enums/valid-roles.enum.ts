import { registerEnumType } from "@nestjs/graphql";

export enum ValidRoles {

    admin = 'admin',
    ejecutivo = 'ejecutivo',
    supervisor = 'supervisor',
    superUser = 'superUser'

}

registerEnumType( ValidRoles, { name: 'ValidRoles' } )


