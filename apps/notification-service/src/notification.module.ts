import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { RedisModule } from '@app/my-library/common/infra/redis/redis.module';
import { BullModule } from '@nestjs/bullmq';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TransferMoneySchemaMongoose } from './models/transfer-money.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: 'AUTH_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: join(
            process.cwd(),
            'libs/my-library/src/contracts/proto/auth.proto',
          ),
          url: '0.0.0.0:5001',
        },
      },
    ]),
    RedisModule.forRoot({ host: 'localhost', password: 'redis', port: 6379 }),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        password: 'redis',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'auth',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGO_URL'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: 'TransferMoney', schema: TransferMoneySchemaMongoose },
    ]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway],
})
export class NotificationModule {}
