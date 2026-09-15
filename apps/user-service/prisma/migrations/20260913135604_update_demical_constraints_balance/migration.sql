/*
  Warnings:

  - You are about to alter the column `balance` on the `users` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "balance" SET DATA TYPE DECIMAL(10,2);
alter table "users" add constraint "users_balance_not_negative" check ("balance" >= 0)
