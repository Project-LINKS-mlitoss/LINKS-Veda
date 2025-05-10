-- AlterTable
ALTER TABLE `schema_managements` ADD COLUMN `asset_status` INTEGER NULL AFTER `asset_url`;

-- AlterTable
ALTER TABLE `schema_visualizes` ADD COLUMN `asset_status` INTEGER NULL AFTER `asset_url`;
