import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import { RedisEvictInterceptor } from '@app/my-library/common/interceptors/redis-evict.interceptor';

export const EVICTION_KEY = 'EVICTION_KEY';

export const Eviction = (...namespaces: string[]) =>
  applyDecorators(
    UseInterceptors(RedisEvictInterceptor),
    SetMetadata(EVICTION_KEY, namespaces),
  );
