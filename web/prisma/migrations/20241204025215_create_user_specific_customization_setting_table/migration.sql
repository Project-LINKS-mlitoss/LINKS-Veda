-- CreateTable
CREATE TABLE `user_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `use_case` VARCHAR(191) NOT NULL,
    `period_setting_id` INTEGER NOT NULL,
    `area_setting_id` INTEGER NOT NULL,
    `flight_plan_setting_id` INTEGER NOT NULL,
    `aircraft_setting_id` INTEGER NOT NULL,
    `accident_setting_id` INTEGER NULL,
    `setting_type` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;

-- CreateTable
CREATE TABLE `period_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `from_date` DATETIME(3) NOT NULL,
    `to_date` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;

-- CreateTable
CREATE TABLE `area_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `area_type` VARCHAR(191) NOT NULL,
    `prefecture` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `town` VARCHAR(191) NULL,
    `various_area_type` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;

-- CreateTable
CREATE TABLE `aircraft_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `manufacturer_name` VARCHAR(191) NULL,
    `model_name` VARCHAR(191) NULL,
    `aircraft_type` VARCHAR(191) NULL,
    `aircraft_weight` VARCHAR(191) NULL,
    `manufacturing_category` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;

-- CreateTable
CREATE TABLE `flight_plan_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `flight_purpose` JSON NULL,
    `flight_method` JSON NULL,
    `flight_altitude` DOUBLE NULL,
    `flight_speed` DOUBLE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;

-- CreateTable
CREATE TABLE `accident_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accident_category` VARCHAR(191) NOT NULL,
    `accident_type` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;

-- CreateTable
CREATE TABLE `graph_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `use_case` VARCHAR(191) NOT NULL,
    `user_setting_id` INTEGER NOT NULL,
    `graph_title` VARCHAR(191) NOT NULL,
    `graph_type` VARCHAR(191) NOT NULL,
    `graph_settings` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;

-- AddForeignKey
ALTER TABLE `user_settings` ADD CONSTRAINT `user_settings_period_setting_id_fkey` FOREIGN KEY (`period_setting_id`) REFERENCES `period_settings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_settings` ADD CONSTRAINT `user_settings_area_setting_id_fkey` FOREIGN KEY (`area_setting_id`) REFERENCES `area_settings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_settings` ADD CONSTRAINT `user_settings_flight_plan_setting_id_fkey` FOREIGN KEY (`flight_plan_setting_id`) REFERENCES `flight_plan_settings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_settings` ADD CONSTRAINT `user_settings_aircraft_setting_id_fkey` FOREIGN KEY (`aircraft_setting_id`) REFERENCES `aircraft_settings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_settings` ADD CONSTRAINT `user_settings_accident_setting_id_fkey` FOREIGN KEY (`accident_setting_id`) REFERENCES `accident_settings`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `graph_settings` ADD CONSTRAINT `graph_settings_user_setting_id_fkey` FOREIGN KEY (`user_setting_id`) REFERENCES `user_settings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
