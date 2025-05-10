/*
  Warnings:

  - Added the required column `parent_content_id` to the `schema_managements` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `schema_managements` ADD COLUMN `parent_content_id` VARCHAR(191) NULL,
    MODIFY `asset_id` VARCHAR(191) NULL,
    MODIFY `asset_url` VARCHAR(191) NULL;
