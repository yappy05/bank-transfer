import { z } from 'zod';
import { Buffer } from 'node:buffer';

export const UploadedMulterFileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string().optional(),
  mimetype: z.string().optional(),
  buffer: z.instanceof(Buffer),
  size: z.int().optional(),
});

export type IUploadedMulterFile = z.infer<typeof UploadedMulterFileSchema>;
