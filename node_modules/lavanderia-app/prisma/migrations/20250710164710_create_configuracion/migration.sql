/*
  Warnings:

  - You are about to alter the column `tasaCOP` on the `configuracion` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Double`.

*/
-- AlterTable
ALTER TABLE `configuracion` ADD COLUMN `tasaUSD` DOUBLE NULL,
    MODIFY `tasaCOP` DOUBLE NULL;
