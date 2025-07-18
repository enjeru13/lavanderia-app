-- AlterTable
ALTER TABLE `configuracion` ADD COLUMN `direccion` VARCHAR(191) NULL,
    ADD COLUMN `mensajePieRecibo` TEXT NULL,
    ADD COLUMN `rif` VARCHAR(191) NULL,
    ADD COLUMN `telefonoPrincipal` VARCHAR(191) NULL,
    ADD COLUMN `telefonoSecundario` VARCHAR(191) NULL;
