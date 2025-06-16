
import { ArgsType, Field } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";
import { ValidRoles } from "src/common/enums/valid-roles.enum";

@ArgsType()
export class ValidRolesArgs {

    @Field( () => ValidRoles, { nullable: true })
    @IsString()
    @IsOptional()
    role: ValidRoles

}
