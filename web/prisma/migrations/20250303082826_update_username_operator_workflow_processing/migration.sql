-- AlterTable
ALTER TABLE `content_configs` ADD COLUMN `username` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `cross_join_content_configs` ADD COLUMN `username` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `preprocess_content_configs` ADD COLUMN `username` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `spatial_aggregate_content_configs` ADD COLUMN `username` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `spatial_join_content_configs` ADD COLUMN `username` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `text_matching_content_configs` ADD COLUMN `username` VARCHAR(191) NULL;
