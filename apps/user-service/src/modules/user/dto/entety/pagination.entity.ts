// export class PaginationEntity {
//   limit: number;
//   offset: number;
// }

import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const PaginationEntitySchema = z.object({
  limit: z.coerce.number().positive().default(10),
  offset: z.coerce.number().nonnegative().default(0),
});

export class PaginationEntityDto extends createZodDto(PaginationEntitySchema) {}
