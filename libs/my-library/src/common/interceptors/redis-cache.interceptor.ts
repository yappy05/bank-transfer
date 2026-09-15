import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, of, tap } from 'rxjs';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import {
  CACHABLE_KEY,
  CachableType,
  CacheScope,
} from '../decorators/cachable.decorator';
import { RedisService } from '@app/my-library/common/infra/redis/redis.service';

@Injectable()
export class RedisCacheInterceptor implements NestInterceptor {
  logger: Logger;
  constructor(
    private readonly redisService: RedisService,
    private readonly reflector: Reflector,
  ) {
    this.logger = new Logger(RedisCacheInterceptor.name);
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request?.user?.sub;
    if (!userId) return next.handle();

    const method = request.method;
    if (method !== 'GET') return next.handle();

    const cachabale: CachableType = this.reflector.getAllAndOverride(
      CACHABLE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!cachabale) return next.handle();

    const key = this.buildKey(cachabale, userId);
    const base = request.url;
    const cache = await this.redisService.get(`${base}/${key}`);
    if (cache) {
      this.logger.log(`взяли значение из кеша`);
      return of(JSON.parse(cache));
    }

    return next.handle().pipe(
      tap((data) => {
        this.logger.log(`положили значение в кеш`);
        void this.redisService.setex(
          `${base}/${key}`,
          cachabale.ttl ?? 60,
          JSON.stringify(data),
        );
      }),
    );
  }
  private buildKey = (cacheData: CachableType, userId?: string) => {
    console.log(cacheData);
    let result = '';
    if (cacheData.scope === CacheScope.USER) result += `${userId}`;
    // else result += 'shared';
    if (cacheData.key) result += `/${cacheData.key}`;
    return result;
  };
}
