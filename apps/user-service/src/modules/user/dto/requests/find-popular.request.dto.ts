import { PaginationEntitySchema } from '../entety/pagination.entity';
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const FindPopularRequestSchema = PaginationEntitySchema.extend({
  minAge: z.coerce.number().max(100).min(6).optional(),
  maxAge: z.coerce.number().max(100).optional(),
});

export class FindPopularRequestDto extends createZodDto(
  FindPopularRequestSchema,
) {}
export type FindPopular = z.infer<typeof FindPopularRequestSchema>;
