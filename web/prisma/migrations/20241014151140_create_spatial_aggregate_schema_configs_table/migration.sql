-- CreateTable
CREATE TABLE `spatial_aggregate_schema_configs` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `left_schema_id` VARCHAR(191) NOT NULL,
    `right_schema_id` VARCHAR(191) NOT NULL,
    `config_json` JSON NOT NULL,
    `ticket_id` VARCHAR(191) NOT NULL,
    `model_id` VARCHAR(191) NOT NULL,
    `schema_id` VARCHAR(191) NOT NULL,
    `status` TINYINT NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
