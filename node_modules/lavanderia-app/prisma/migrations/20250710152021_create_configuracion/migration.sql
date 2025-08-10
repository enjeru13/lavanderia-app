-- CreateTable
CREATE TABLE `Configuracion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombreNegocio` VARCHAR(191) NOT NULL,
    `monedaPrincipal` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `tasaVES` DOUBLE NULL,
    `tasaCOP` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
