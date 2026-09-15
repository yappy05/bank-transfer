import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class BalanceService implements OnApplicationBootstrap {
  logger: Logger;
  constructor(
    private readonly userRepository: UserRepository,
    @InjectQueue('transfer') private readonly transferQueue: Queue,
  ) {
    this.logger = new Logger();
  }

  async onApplicationBootstrap() {
    await this.cron();
  }

  public async clean(login: string) {
    await this.transferQueue.add('balance-zero', {
      user_login: login,
    });
    return { success: true };
  }

  public async cron() {
    const job = await this.transferQueue.upsertJobScheduler('cron', {
      pattern: '*/10 * * * *',
    });
    if (!job) this.logger.warn('Планировщик не создан: проверь cron паттерн');
    return { success: true, scheduler: 'cron', nextJobId: job?.id };
  }
}
