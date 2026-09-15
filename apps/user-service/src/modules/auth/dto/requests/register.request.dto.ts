import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const RegisterRequestSchema = z
  .object({
    login: z
      .string()
      .min(6, 'логин минимум 6 символов')
      .trim()
      .describe('логин'),
    email: z.string(),
    password: z.string().min(8, 'пароль минимум 8 символов'),
    age: z.int().min(18).max(50),
    about: z.string().min(10, 'миинимум 10 символов'),
  })
  .required();

// export type RegisterRequestDto = z.infer<typeof RegisterRequestSchema>;
export class RegisterRequestDto extends createZodDto(RegisterRequestSchema) {}
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
