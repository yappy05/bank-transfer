import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const TransferMoneyRequestSchema = z.object({
  targetUserId: z.string(),
  amount: z.number().nonnegative('сумма не может быть отрицательной'),
});

export type TransferMoney = z.infer<typeof TransferMoneyRequestSchema>;
export class TransferMoneyRequestDto extends createZodDto(
  TransferMoneyRequestSchema,
) {}
