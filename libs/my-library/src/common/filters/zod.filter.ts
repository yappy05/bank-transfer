import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  HttpException,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ZodSerializationException } from 'nestjs-zod';
import { ZodError } from 'zod';

@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    this.logger.error('Ошибка');
    if (exception instanceof ZodSerializationException) {
      const zodError = exception.getZodError();
      if (zodError instanceof ZodError) {
        this.logger.error(`ZodSerializationException: ${zodError.message}`);
        throw new BadRequestException({
          message:
            'Ошибка серилизации ответа. Операция была выполнена, но ответ пользователю не коректный',
          issues: zodError.issues.map((issue) => ({
            field: issue.path[0],
            message: issue.message,
          })),
        });
      }
    }

    super.catch(exception, host);
  }
}
