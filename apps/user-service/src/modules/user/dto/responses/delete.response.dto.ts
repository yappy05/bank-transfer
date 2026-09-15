import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const DeleteResponseSchema = z.object({
  success: z.boolean(),
});

export class DeleteResponseDto extends createZodDto(DeleteResponseSchema) {}
