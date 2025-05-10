-- AlterTable
ALTER TABLE `preprocess_schema_configs` ADD COLUMN `status` TINYINT NOT NULL DEFAULT 1 AFTER `schema_id`;

-- AlterTable
ALTER TABLE `schema_configs` ADD COLUMN `status` TINYINT NOT NULL DEFAULT 1 AFTER `schema_id`;
