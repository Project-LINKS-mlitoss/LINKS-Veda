-- CreateTable
CREATE TABLE `content_asset_creation_logs` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `content_id` VARCHAR(191) NOT NULL,
    `asset_id` VARCHAR(191) NULL,
    `asset_url` VARCHAR(191) NULL,
    `type` VARCHAR(191) NOT NULL,
    `status` TINYINT NOT NULL DEFAULT 1,
    `user_id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
