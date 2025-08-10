/*
  Warnings:

  - You are about to alter the column `estadoPago` on the `orden` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(3))`.
  - You are about to alter the column `moneda` on the `pago` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(3))` to `VarChar(191)`.
  - A unique constraint covering the columns `[identificacion]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Servicio_nombreServicio_key` ON `servicio`;

-- AlterTable
ALTER TABLE `configuracion` MODIFY `id` INTEGER NOT NULL DEFAULT 1,
    MODIFY `nombreNegocio` VARCHAR(191) NULL,
    ALTER COLUMN `tasaUSD` DROP DEFAULT,
    MODIFY `mensajePieRecibo` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `orden` MODIFY `estado` ENUM('PENDIENTE', 'ENTREGADO') NOT NULL DEFAULT 'PENDIENTE',
    MODIFY `estadoPago` ENUM('COMPLETO', 'INCOMPLETO') NOT NULL DEFAULT 'INCOMPLETO';

-- AlterTable
ALTER TABLE `pago` MODIFY `nota` VARCHAR(191) NULL,
    MODIFY `moneda` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `role` ENUM('ADMIN', 'EMPLOYEE') NOT NULL DEFAULT 'EMPLOYEE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Cliente_identificacion_key` ON `Cliente`(`identificacion`);
