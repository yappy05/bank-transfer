import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  constructor() {
    super({
      host: 'localhost',
      port: 6379,
      password: 'redis',
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
