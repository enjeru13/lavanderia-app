/*
  Warnings:

  - You are about to drop the column `monedaVuelto` on the `pago` table. All the data in the column will be lost.
  - You are about to drop the column `vueltoEntregado` on the `pago` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `pago` DROP COLUMN `monedaVuelto`,
    DROP COLUMN `vueltoEntregado`;

-- CreateTable
CREATE TABLE `VueltoEntregado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pagoId` INTEGER NOT NULL,
    `monto` DOUBLE NOT NULL,
    `moneda` VARCHAR(191) NOT NULL,

    INDEX `VueltoEntregado_pagoId_idx`(`pagoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `VueltoEntregado` ADD CONSTRAINT `VueltoEntregado_pagoId_fkey` FOREIGN KEY (`pagoId`) REFERENCES `Pago`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
