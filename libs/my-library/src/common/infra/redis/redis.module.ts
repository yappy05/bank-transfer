import { Module } from '@nestjs/common';
import {
  RedisOptions,
  RedisService,
} from '@app/my-library/common/infra/redis/redis.service';

@Module({
  providers: [RedisService],
})
export class RedisModule {
  static forRoot(options: RedisOptions) {
    const redisProvider = new RedisService(options);
    return {
      module: RedisModule,
      providers: redisProvider,
      exports: redisProvider,
    };
  }
}
