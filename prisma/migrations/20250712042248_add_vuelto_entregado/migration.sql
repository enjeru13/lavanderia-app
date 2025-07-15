/*
  Warnings:

  - The values [PAGADO] on the enum `Orden_estado` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `orden` MODIFY `estado` ENUM('PENDIENTE', 'ENTREGADO') NOT NULL;

-- AlterTable
ALTER TABLE `pago` ADD COLUMN `vueltoEntregado` DOUBLE NULL;
