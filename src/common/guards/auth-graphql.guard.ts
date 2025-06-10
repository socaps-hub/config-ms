import {
    CanActivate,
    ExecutionContext,
    HttpStatus,
    Inject,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy, RpcException } from '@nestjs/microservices';

import { Request } from 'express';
import { NATS_SERVICE } from 'src/config';
import { envs } from 'src/config/envs';
  
@Injectable()
export class AuthGraphQLGuard implements CanActivate {

    constructor(
        private readonly _jwtService: JwtService,
        @Inject(NATS_SERVICE) private readonly _client: ClientProxy,
        // private readonly _usuariosService: UsuariosService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const ctx = GqlExecutionContext.create( context )
        const request = ctx.getContext().req
        const token = this.extractTokenFromHeader(request)

        if (!token) {
            throw new UnauthorizedException('Token not found')
        }

        try {
            const payload = await this._jwtService.verifyAsync(
                token,
                {
                    secret: envs.jwtSecret
                }
            );

            // const user = await this._usuariosService.findByID( payload.R12Id )
            const user = await this._client.send('supervision.usuarios.getByID', { id: payload.R12Id })

            request['user'] = user;
            
        } catch {
            throw new RpcException({
                message: 'Token not found',
                status: HttpStatus.UNAUTHORIZED
            });
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? []
        return type === 'Bearer' ? token : undefined
    }

}
  