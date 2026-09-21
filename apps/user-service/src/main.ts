import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { ConsoleLogger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: 'app',
    }),
  });
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: join(
        process.cwd(),
        'libs/my-library/src/contracts/proto/auth.proto',
      ),
      url: '0.0.0.0:5001',
    },
  });

  const openApiDoc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Auth service')
      .setDescription('The auth & user API description')
      .setVersion('1.0.0')
      .addTag('auth')
      .addTag('users')
      .addBearerAuth()
      .build(),
  );
  SwaggerModule.setup('api', app, cleanupOpenApiDoc(openApiDoc));

  await app.startAllMicroservices();

  await app.listen(process.env.PORT ?? 8000, () =>
    console.log(
      `приложение запущено на http://localhost:8000\nswagger: http://localhost:8000/api`,
    ),
  );
}
bootstrap();
