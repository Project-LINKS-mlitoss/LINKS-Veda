/*
  Warnings:

  - You are about to drop the column `content_metadata` on the `datasets` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `datasets` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `datasets` table. All the data in the column will be lost.
  - You are about to drop the column `specification` on the `datasets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `datasets` DROP COLUMN `content_metadata`,
    DROP COLUMN `description`,
    DROP COLUMN `metadata`,
    DROP COLUMN `specification`,
    ADD COLUMN `asset_id` VARCHAR(191) NULL,
    ADD COLUMN `asset_url` TEXT NULL,
    ADD COLUMN `metaData` JSON NULL,
    ADD COLUMN `resource_markdown_id` VARCHAR(191) NULL;
