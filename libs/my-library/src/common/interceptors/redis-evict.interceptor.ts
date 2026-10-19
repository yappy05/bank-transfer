import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { EVICTION_KEY } from '../decorators/eviction.decorator';
import { RedisService } from '@app/my-library/common/infra/redis/redis.service';

@Injectable()
export class RedisEvictInterceptor implements NestInterceptor {
  logger: Logger;
  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
  ) {
    this.logger = new Logger();
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request?.user?.sub;

    const body = request.body as unknown;

    const namespaces: string[] = this.reflector.getAllAndOverride(
      EVICTION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (namespaces.length === 0) return next.handle();

    for (const ns of namespaces) {
      const pattern = ns
        .replace('{user_id}', userId ?? '')
        .replace(
          '{target_user_id}',
          typeof body === 'object' &&
            body &&
            'targetUserId' in body &&
            typeof body['targetUserId'] === 'string'
            ? body['targetUserId']
            : '',
        );
      await this.redisService.deleteByPattern(`${pattern}`);
      this.logger.debug(`кеш удалили по ключу ${pattern}, ${ns}`);
    }

    return next.handle();
  }
}
