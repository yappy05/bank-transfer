import { createZodValidationPipe } from 'nestjs-zod';
import { BadRequestException } from '@nestjs/common';
import { ZodError } from 'zod';

export const CustomZodValidationPipe = createZodValidationPipe({
  createValidationException: (error: ZodError) => {
    return new BadRequestException({
      message: 'Ошибка валидации данных, переданных пользователем',
      issues: error.issues.map((issue) => ({
        field: issue.path[0],
        message: issue.message,
      })),
    });
  },
});
