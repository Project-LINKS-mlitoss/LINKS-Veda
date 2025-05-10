/*
  Warnings:

  - You are about to drop the column `resource_id` on the `schema_managements` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `schema_managements` DROP COLUMN `resource_id`,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE `datasets` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `package_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;

-- CreateTable
CREATE TABLE `dataset_schema_managements` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `schema_management_id` INTEGER NOT NULL,
    `dataset_id` INTEGER NOT NULL,
    `resource_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
