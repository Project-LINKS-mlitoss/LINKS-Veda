-- AlterTable
ALTER TABLE `content_chats` ADD COLUMN `status` INTEGER NOT NULL DEFAULT 1;

-- Migrate all data
UPDATE `content_chats` SET `status` = 3 where `created_at` < NOW();