import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const FindOneResponseSchema = z.object({
  login: z.string(),
  email: z.string(),
  age: z.int(),
  about: z.string().optional(),
  balance: z.number(),
});

export class FindOneResponseDto extends createZodDto(FindOneResponseSchema) {}
export type FindOneResponse = z.infer<typeof FindOneResponseSchema>;
