import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const DeleteRequestSchema = z.object({
  avatarId: z.string(),
});

export type DeleteRequest = z.infer<typeof DeleteRequestSchema>;
export class DeleteRequestDto extends createZodDto(DeleteRequestSchema) {}
