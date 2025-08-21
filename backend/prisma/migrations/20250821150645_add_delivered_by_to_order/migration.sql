-- AlterTable
ALTER TABLE `Orden` ADD COLUMN `deliveredByUserId` INTEGER NULL,
    ADD COLUMN `deliveredByUserName` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Orden_estado_idx` ON `Orden`(`estado`);

-- CreateIndex
CREATE INDEX `Orden_deliveredByUserId_idx` ON `Orden`(`deliveredByUserId`);

-- AddForeignKey
ALTER TABLE `Orden` ADD CONSTRAINT `Orden_deliveredByUserId_fkey` FOREIGN KEY (`deliveredByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `Orden` RENAME INDEX `Orden_clienteId_fkey` TO `Orden_clienteId_idx`;
