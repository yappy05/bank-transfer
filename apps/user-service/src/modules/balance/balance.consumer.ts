import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UserRepository } from '../user/user.repository';
import { Logger } from '@nestjs/common';

@Processor('transfer')
export class BalanceConsumer extends WorkerHost {
  logger: Logger;
  constructor(private readonly userRepository: UserRepository) {
    super();
    this.logger = new Logger(BalanceConsumer.name);
  }
  async process(job: Job<{ user_login: string }>): Promise<any> {
    switch (job.name) {
      case 'balance-zero':
        this.logger.log(
          `Пользователь ${job.data.user_login} обнулил всем баланс`,
        );
        await this.userRepository.cleanBalance();
        break;
      case 'cron':
        await this.userRepository.cleanBalance();
        this.logger.debug('Сработал крон обнуления баланса');
        break;
      default:
        this.logger.warn('прилетела неизветсная джоба');
    }
  }
}
