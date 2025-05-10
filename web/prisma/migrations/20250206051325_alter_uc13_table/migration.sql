/*
  Warnings:

  - You are about to drop the column `minimum_co2_flag` on the `usecase13_route_search_logistics_bases` table. All the data in the column will be lost.
  - You are about to drop the column `total_co2` on the `usecase13_route_search_logistics_bases` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `usecase13_route_search_logistics_bases_total_co2_idx` ON `usecase13_route_search_logistics_bases`;

-- DropIndex
DROP INDEX `usecase13_route_search_logistics_bases_total_distance_idx` ON `usecase13_route_search_logistics_bases`;

-- AlterTable
ALTER TABLE `usecase13_route_search_logistics_bases` DROP COLUMN `minimum_co2_flag`,
    DROP COLUMN `total_co2`,
    ADD COLUMN `waypoint_distance_1` FLOAT NULL,
    ADD COLUMN `waypoint_distance_2` FLOAT NULL,
    ADD COLUMN `waypoint_distance_3` FLOAT NULL,
    ADD COLUMN `waypoint_distance_4` FLOAT NULL,
    ADD COLUMN `waypoint_distance_5` FLOAT NULL,
    ADD COLUMN `waypoint_lat_1` DOUBLE NULL,
    ADD COLUMN `waypoint_lat_2` DOUBLE NULL,
    ADD COLUMN `waypoint_lat_3` DOUBLE NULL,
    ADD COLUMN `waypoint_lat_4` DOUBLE NULL,
    ADD COLUMN `waypoint_lat_5` DOUBLE NULL,
    ADD COLUMN `waypoint_lon_1` DOUBLE NULL,
    ADD COLUMN `waypoint_lon_2` DOUBLE NULL,
    ADD COLUMN `waypoint_lon_3` DOUBLE NULL,
    ADD COLUMN `waypoint_lon_4` DOUBLE NULL,
    ADD COLUMN `waypoint_lon_5` DOUBLE NULL,
    ADD COLUMN `waypoint_mode_1` TEXT NULL,
    ADD COLUMN `waypoint_mode_2` TEXT NULL,
    ADD COLUMN `waypoint_mode_3` TEXT NULL,
    ADD COLUMN `waypoint_mode_4` TEXT NULL,
    ADD COLUMN `waypoint_mode_5` TEXT NULL,
    ADD COLUMN `waypoint_name_1` TEXT NULL,
    ADD COLUMN `waypoint_name_2` TEXT NULL,
    ADD COLUMN `waypoint_name_3` TEXT NULL,
    ADD COLUMN `waypoint_name_4` TEXT NULL,
    ADD COLUMN `waypoint_name_5` TEXT NULL,
    ADD COLUMN `waypoint_time_1` FLOAT NULL,
    ADD COLUMN `waypoint_time_2` FLOAT NULL,
    ADD COLUMN `waypoint_time_3` FLOAT NULL,
    ADD COLUMN `waypoint_time_4` FLOAT NULL,
    ADD COLUMN `waypoint_time_5` FLOAT NULL;
