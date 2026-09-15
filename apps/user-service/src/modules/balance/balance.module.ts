import { Module } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { BalanceController } from './balance.controller';
import { UserModule } from '../user/user.module';
import { BullModule } from '@nestjs/bullmq';
import { BalanceConsumer } from './balance.consumer';

@Module({
  imports: [
    UserModule,
    BullModule.registerQueue({
      name: 'transfer',
    }),
  ],
  providers: [BalanceService, BalanceConsumer],
  controllers: [BalanceController],
})
export class BalanceModule {}
