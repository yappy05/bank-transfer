import {
  CallHandler,
  ExecutionContext,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

export class LoggerInterceptor implements NestInterceptor {
  private logger: Logger;
  constructor() {
    this.logger = new Logger();
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const user_id = request?.user?.sub;
    this.logger.debug(
      `user: ${user_id ? this.sliceUserId(user_id) : 'anonymous'}, method: ${request.method}, controller: ${context.getClass().name}, handler: ${context.getHandler().name}, path: ${request.url}`,
    );
    return next.handle();
  }
  private sliceUserId(userId: string) {
    return userId.slice(0, 6);
  }
}
