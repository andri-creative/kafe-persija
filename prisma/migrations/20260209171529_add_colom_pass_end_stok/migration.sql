-- AlterTable
ALTER TABLE `product_variants` ADD COLUMN `size` VARCHAR(191) NULL,
    ADD COLUMN `status` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `stok` INTEGER NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `role` MODIFY `name` VARCHAR(191) NOT NULL DEFAULT 'customer';

-- AlterTable
ALTER TABLE `user` ADD COLUMN `password` VARCHAR(191) NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'active';
