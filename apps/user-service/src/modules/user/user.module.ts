import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
  imports: [
    ClientsModule.register([
      {
        name: 'BALANCE_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'balance',
            brokers: ['localhost:9092'],
            producerOnlyMode: true,
          },
        },
      },
    ]),
  ],
})
export class UserModule {}
