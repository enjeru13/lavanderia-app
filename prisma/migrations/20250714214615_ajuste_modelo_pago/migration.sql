/*
  Warnings:

  - You are about to alter the column `moneda` on the `pago` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.

*/
-- AlterTable
ALTER TABLE `pago` MODIFY `nota` TEXT NULL,
    MODIFY `moneda` ENUM('USD', 'VES', 'COP') NOT NULL;
