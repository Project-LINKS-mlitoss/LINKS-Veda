-- AlterTable
ALTER TABLE `content_chats`
    CHANGE COLUMN `schema_id` `content_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `content_managements`
    CHANGE COLUMN `schema_id` `content_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `content_visualizes`
    CHANGE COLUMN `schema_id` `content_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `cross_join_content_configs`
    CHANGE COLUMN `input_schema_id` `input_content_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `dataset_content_managements`
    CHANGE COLUMN `schema_id` `content_id` VARCHAR(191) NOT NULL,
    CHANGE COLUMN `schema_management_id` `content_management_id` INTEGER NULL,
    CHANGE COLUMN `schema_visualize_id` `content_visualize_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `spatial_aggregate_content_configs`
    CHANGE COLUMN `left_schema_id` `left_content_id` VARCHAR(191) NOT NULL,
    CHANGE COLUMN `right_schema_id` `right_content_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `spatial_join_content_configs`
    CHANGE COLUMN `left_schema_id` `left_content_id` VARCHAR(191) NOT NULL,
    CHANGE COLUMN `right_schema_id` `right_content_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `text_matching_content_configs`
    CHANGE COLUMN `left_schema_id` `left_content_id` VARCHAR(191) NOT NULL,
    CHANGE COLUMN `right_schema_id` `right_content_id` VARCHAR(191) NOT NULL;
