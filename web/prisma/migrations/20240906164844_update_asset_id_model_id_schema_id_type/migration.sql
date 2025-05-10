-- AlterTable
ALTER TABLE `schema_configs` MODIFY `asset_id` VARCHAR(191) NOT NULL,
    MODIFY `model_id` VARCHAR(191) NOT NULL,
    MODIFY `schema_id` VARCHAR(191) NOT NULL;
