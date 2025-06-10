import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const GetUserGraphQL = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {

    const ctx = GqlExecutionContext.create( context )
    const request = ctx.getContext().req

    if ( !request.user ) {
        throw new InternalServerErrorException('User not found in request (AuthGraphQLGuard called?)')
    }

    return request.user;
  },
);