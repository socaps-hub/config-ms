import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config';

@Module({
    imports: [
        JwtModule.register({
            global: true,
            secret: envs.jwtSecret,
            signOptions: { expiresIn: '2h' },
        }),
    ]
})
export class CommonModule {}
