import { z } from 'zod';
import { toMongooseSchema } from '@nullix/zod-mongoose';

export const TransferMoneySchemaZod = z.object({
  senderId: z.string(),
  recipientId: z.string(),
  amount: z.int(),
});

export const TransferMoneySchemaMongoose = toMongooseSchema(
  TransferMoneySchemaZod,
);

export type TransferMoneyZodType = z.infer<typeof TransferMoneySchemaZod>;
export type TransferMoney = z.infer<typeof TransferMoneySchemaMongoose>;
