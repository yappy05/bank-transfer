import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const LoginSchema = z
  .object({
    login: z.string().min(6, 'логин минимум 6 символов').trim(),
    password: z.string().min(8, 'пароль минимум 8 символов'),
  })
  .required();

export class LoginRequestDto extends createZodDto(LoginSchema) {}
