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

-- CreateTable
CREATE TABLE `Cliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191) NOT NULL,
    `tipo` ENUM('NATURAL', 'EMPRESA') NOT NULL,
    `telefono` VARCHAR(191) NOT NULL,
    `telefono_secundario` VARCHAR(191) NULL,
    `direccion` VARCHAR(191) NOT NULL,
    `identificacion` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `fechaRegistro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Cliente_identificacion_key`(`identificacion`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Categoria` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Categoria_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Servicio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombreServicio` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `precioBase` DOUBLE NOT NULL,
    `permiteDecimales` BOOLEAN NOT NULL DEFAULT false,
    `categoriaId` VARCHAR(191) NOT NULL,

    INDEX `Servicio_categoriaId_fkey`(`categoriaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Orden` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` INTEGER NOT NULL,
    `estado` ENUM('PENDIENTE', 'ENTREGADO') NOT NULL DEFAULT 'PENDIENTE',
    `fechaIngreso` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaEntrega` DATETIME(3) NULL,
    `observaciones` VARCHAR(191) NULL,
    `total` DOUBLE NOT NULL,
    `abonado` DOUBLE NOT NULL DEFAULT 0,
    `faltante` DOUBLE NOT NULL DEFAULT 0,
    `estadoPago` ENUM('COMPLETO', 'INCOMPLETO') NOT NULL DEFAULT 'INCOMPLETO',
    `deliveredByUserId` INTEGER NULL,
    `deliveredByUserName` VARCHAR(191) NULL,

    INDEX `Orden_clienteId_idx`(`clienteId`),
    INDEX `Orden_estado_idx`(`estado`),
    INDEX `Orden_deliveredByUserId_idx`(`deliveredByUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DetalleOrden` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ordenId` INTEGER NOT NULL,
    `servicioId` INTEGER NOT NULL,
    `cantidad` DOUBLE NOT NULL,
    `precioUnit` DOUBLE NOT NULL,
    `subtotal` DOUBLE NOT NULL,

    INDEX `DetalleOrden_ordenId_fkey`(`ordenId`),
    INDEX `DetalleOrden_servicioId_fkey`(`servicioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pago` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ordenId` INTEGER NOT NULL,
    `monto` DOUBLE NOT NULL,
    `moneda` ENUM('USD', 'VES', 'COP') NOT NULL,
    `metodoPago` ENUM('EFECTIVO', 'TRANSFERENCIA', 'PAGO_MOVIL') NOT NULL,
    `nota` VARCHAR(191) NULL,
    `fechaPago` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Pago_ordenId_fkey`(`ordenId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VueltoEntregado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pagoId` INTEGER NOT NULL,
    `monto` DOUBLE NOT NULL,
    `moneda` VARCHAR(191) NOT NULL,

    INDEX `VueltoEntregado_pagoId_idx`(`pagoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Configuracion` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `nombreNegocio` VARCHAR(191) NULL,
    `monedaPrincipal` ENUM('USD', 'VES', 'COP') NOT NULL DEFAULT 'USD',
    `tasaUSD` DOUBLE NULL,
    `tasaVES` DOUBLE NULL,
    `tasaCOP` DOUBLE NULL,
    `rif` VARCHAR(191) NULL,
    `direccion` VARCHAR(191) NULL,
    `telefonoPrincipal` VARCHAR(191) NULL,
    `telefonoSecundario` VARCHAR(191) NULL,
    `mensajePieRecibo` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Servicio` ADD CONSTRAINT `Servicio_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `Categoria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Orden` ADD CONSTRAINT `Orden_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Orden` ADD CONSTRAINT `Orden_deliveredByUserId_fkey` FOREIGN KEY (`deliveredByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetalleOrden` ADD CONSTRAINT `DetalleOrden_ordenId_fkey` FOREIGN KEY (`ordenId`) REFERENCES `Orden`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetalleOrden` ADD CONSTRAINT `DetalleOrden_servicioId_fkey` FOREIGN KEY (`servicioId`) REFERENCES `Servicio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pago` ADD CONSTRAINT `Pago_ordenId_fkey` FOREIGN KEY (`ordenId`) REFERENCES `Orden`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VueltoEntregado` ADD CONSTRAINT `VueltoEntregado_pagoId_fkey` FOREIGN KEY (`pagoId`) REFERENCES `Pago`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

