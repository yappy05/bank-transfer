import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

export type RedisOptions = {
  host: string;
  port: number;
  password: string;
};

export const REDIS_OPTION = 'REDIS_OPTION';

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  constructor(@Inject(REDIS_OPTION) options: RedisOptions) {
    super({
      host: options.host,
      port: options.port,
      password: options.password,
    });
  }

  async onModuleDestroy() {
    await this.quit();
  }

  async deleteByPattern(pattern: string): Promise<number> {
    const stream = this.scanStream({ match: pattern, count: 100 });
    let deleted = 0;
    for await (const keys of stream) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (keys.length) deleted += await this.del(keys as string[]);
    }
    return deleted;
  }
}
