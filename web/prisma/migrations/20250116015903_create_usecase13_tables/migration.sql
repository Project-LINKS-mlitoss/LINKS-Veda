-- CreateTable
CREATE TABLE `usecase13_prefectures` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `geom` GEOMETRY NOT NULL SRID 4326, SPATIAL INDEX(geom),
    `name` TEXT NOT NULL,

    INDEX `usecase13_prefectures_name_idx`(`name`(32)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;

-- CreateTable
CREATE TABLE `usecase13_prefecture_points` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `geom` GEOMETRY NOT NULL SRID 4326, SPATIAL INDEX(geom),
    `name` TEXT NOT NULL,

    INDEX `usecase13_prefecture_points_name_idx`(`name`(32)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;

-- CreateTable
CREATE TABLE `usecase13_route_search_logistics_bases` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `geom` GEOMETRY NOT NULL SRID 4326, SPATIAL INDEX(geom),
    `origin_name` TEXT NOT NULL,
    `origin_lon` DOUBLE NOT NULL,
    `origin_lat` DOUBLE NOT NULL,
    `destination_name` TEXT NOT NULL,
    `destination_lon` DOUBLE NOT NULL,
    `destination_lat` DOUBLE NOT NULL,
    `transportation_mode` TEXT NOT NULL,
    `minimum_time_flag` INTEGER NOT NULL,
    `minimum_distance_flag` INTEGER NOT NULL,
    `minimum_co2_flag` INTEGER NOT NULL,
    `total_time` FLOAT NOT NULL,
    `total_distance` FLOAT NOT NULL,
    `total_co2` FLOAT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `usecase13_route_search_logistics_bases_origin_name_idx`(`origin_name`(32)),
    INDEX `usecase13_route_search_logistics_bases_destination_name_idx`(`destination_name`(32)),
    INDEX `usecase13_route_search_logistics_bases_transportation_mode_idx`(`transportation_mode`(32)),
    INDEX `usecase13_route_search_logistics_bases_total_time_idx`(`total_time`),
    INDEX `usecase13_route_search_logistics_bases_total_distance_idx`(`total_distance`),
    INDEX `usecase13_route_search_logistics_bases_total_co2_idx`(`total_co2`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
