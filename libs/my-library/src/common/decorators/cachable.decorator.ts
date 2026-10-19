import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import { RedisCacheInterceptor } from '@app/my-library/common/interceptors/redis-cache.interceptor';

export const CACHABLE_KEY = 'CACHABLE_KEY';

export enum CacheScope {
  USER = 'user',
  SHARED = 'shared',
}

export type CachableType = {
  ttl?: string;
  key?: string;
  scope: CacheScope;
};

export const Cachable = (options: CachableType) =>
  applyDecorators(
    UseInterceptors(RedisCacheInterceptor),
    SetMetadata(CACHABLE_KEY, options),
  );
