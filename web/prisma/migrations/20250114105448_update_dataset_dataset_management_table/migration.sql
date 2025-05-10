/*
  Warnings:

  - Added the required column `schema_id` to the `dataset_schema_managements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schema_visualize_id` to the `dataset_schema_managements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `use_case_id` to the `datasets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `dataset_schema_managements` ADD COLUMN `schema_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `schema_visualize_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `datasets` ADD COLUMN `content_metadata` VARCHAR(191) NULL,
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `is_publish` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `metadata` VARCHAR(191) NULL,
    ADD COLUMN `specification` VARCHAR(191) NULL,
    ADD COLUMN `use_case_id` INTEGER UNSIGNED NOT NULL;

-- AddForeignKey
ALTER TABLE `datasets` ADD CONSTRAINT `datasets_use_case_id_fkey` FOREIGN KEY (`use_case_id`) REFERENCES `use_cases`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
