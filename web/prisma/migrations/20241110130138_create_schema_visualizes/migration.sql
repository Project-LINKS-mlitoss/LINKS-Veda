-- CreateTable
CREATE TABLE `schema_visualizes` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `schema_id` VARCHAR(191) NOT NULL,
    `visualize_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
