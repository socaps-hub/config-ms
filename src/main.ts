import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';
import { envs } from './config/envs';

async function bootstrap() {
  const logger = new Logger('Config-ms')
  
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: envs.natServers,
    }
  })  
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  console.log('Primer cambio');  

  await app.startAllMicroservices()
  console.log('✅ Microservicio conectado a NATS (Config-MS)');
  
  await app.listen( envs.port ) // GraphQL Expuesto localmente
  logger.log(`Config Microservice running on port ${ envs.port }`)
}
bootstrap();
