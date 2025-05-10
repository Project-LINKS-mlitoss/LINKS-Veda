-- AlterTable
ALTER TABLE `schema_managements` ADD COLUMN `user_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `username` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `schema_visualizes` ADD COLUMN `user_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `username` VARCHAR(191) NOT NULL;
