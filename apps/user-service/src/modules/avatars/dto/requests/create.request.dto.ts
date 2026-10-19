import { z } from 'zod';
import { UploadedMulterFileSchema } from '../../../../providers/files/s3/interfaces/upload-file.interface';
import { createZodDto } from 'nestjs-zod';
//
// export const I
//
export const CreateRequestSchema = z.object({
  files: z.array(UploadedMulterFileSchema),
  userId: z.string(),
});

export class CreateRequestDto extends createZodDto(CreateRequestSchema) {}
export type CreateRequest = z.infer<typeof CreateRequestSchema>;
