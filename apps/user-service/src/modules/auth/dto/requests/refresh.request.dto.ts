import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const RefreshRequestSchema = z.object({
  refreshToken: z.string(),
});

export class RefreshRequestDto extends createZodDto(RefreshRequestSchema) {}
export type RefreshRequest = z.infer<typeof RefreshRequestSchema>;
