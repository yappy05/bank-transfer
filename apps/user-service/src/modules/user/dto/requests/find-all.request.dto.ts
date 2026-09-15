import { z } from 'zod';
import { PaginationEntitySchema } from '../entety/pagination.entity';
import { createZodDto } from 'nestjs-zod';

export const FindAllRequestSchema = PaginationEntitySchema.extend({
  login: z.string().optional(),
});

export class FindAllRequestDto extends createZodDto(FindAllRequestSchema) {}
export type FindAllRequest = z.infer<typeof FindAllRequestSchema>;
