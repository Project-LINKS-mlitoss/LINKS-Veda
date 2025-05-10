/*
  Warnings:

  - Added the required column `username` to the `resource_permissions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `resource_permissions` ADD COLUMN `username` VARCHAR(191) NOT NULL after `user_id`;
