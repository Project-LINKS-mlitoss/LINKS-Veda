/*
  Warnings:

  - You are about to drop the column `visualize_id` on the `schema_visualizes` table. All the data in the column will be lost.
  - Added the required column `asset_id` to the `schema_visualizes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `asset_url` to the `schema_visualizes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `schema_visualizes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `schema_visualizes` DROP COLUMN `visualize_id`,
    ADD COLUMN `asset_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `asset_url` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL;
