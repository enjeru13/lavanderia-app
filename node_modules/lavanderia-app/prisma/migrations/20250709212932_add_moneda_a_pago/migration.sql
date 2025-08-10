/*
  Warnings:

  - Added the required column `moneda` to the `Pago` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `pago` ADD COLUMN `moneda` VARCHAR(191) NOT NULL,
    MODIFY `metodoPago` ENUM('EFECTIVO', 'TRANSFERENCIA', 'PAGO_MOVIL') NOT NULL;
