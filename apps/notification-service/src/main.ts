import { NestFactory } from '@nestjs/core';
import { NotificationModule } from './notification.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(NotificationModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'notification-producer',
        brokers: ['localhost:9092'],
      },
      consumer: { groupId: 'notification-consumer' },
    },
  });

  await app.startAllMicroservices();

  await app.listen(3000, () => console.log('3000!!!!'));
}

bootstrap();
