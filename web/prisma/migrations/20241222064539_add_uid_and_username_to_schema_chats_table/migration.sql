/*
  Warnings:

  - Added the required column `user_id` to the `schema_chats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `schema_chats` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `schema_chats` ADD COLUMN `user_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `username` VARCHAR(191) NOT NULL;
