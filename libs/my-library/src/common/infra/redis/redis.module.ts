import { DynamicModule, Module } from '@nestjs/common';
import {
  REDIS_OPTION,
  RedisOptions,
  RedisService,
} from '@app/my-library/common/infra/redis/redis.service';

@Module({
  providers: [RedisService],
})
export class RedisModule {
  static forRoot(options: RedisOptions): DynamicModule {
    return {
      module: RedisModule,
      global: true,
      providers: [
        {
          provide: REDIS_OPTION,
          useValue: options,
        },
        RedisService,
      ],
      exports: [RedisService],
    };
  }
}
