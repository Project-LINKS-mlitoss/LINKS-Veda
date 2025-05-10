-- CreateTable
CREATE TABLE `content_metadata` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `content_id` VARCHAR(191) NOT NULL,
    `metadata_json` JSON NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
