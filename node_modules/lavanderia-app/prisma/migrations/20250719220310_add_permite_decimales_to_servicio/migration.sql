/*
  Warnings:

  - A unique constraint covering the columns `[nombreServicio]` on the table `Servicio` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `servicio` ADD COLUMN `permiteDecimales` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX `Servicio_nombreServicio_key` ON `Servicio`(`nombreServicio`);
