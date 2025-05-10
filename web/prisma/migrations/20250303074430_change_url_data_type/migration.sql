-- AlterTable
ALTER TABLE `content_asset_creation_logs` MODIFY `asset_url` TEXT NULL;

-- AlterTable
ALTER TABLE `content_managements` MODIFY `asset_url` TEXT NULL;

-- AlterTable
ALTER TABLE `content_visualizes` MODIFY `asset_url` TEXT NULL;
