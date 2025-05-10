-- DropForeignKey
ALTER TABLE `dataset_schema_managements` DROP FOREIGN KEY `dataset_schema_managements_dataset_id_fkey`;

ALTER TABLE `dataset_schema_managements`
    RENAME TO  `dataset_content_managements` ;

ALTER TABLE `schema_chats`
    RENAME TO  `content_chats` ;

ALTER TABLE `schema_managements`
    RENAME TO  `content_managements` ;

ALTER TABLE `schema_visualizes`
    RENAME TO  `content_visualizes` ;

-- AddForeignKey
ALTER TABLE `dataset_content_managements` ADD CONSTRAINT `dataset_content_managements_dataset_id_fkey` FOREIGN KEY (`dataset_id`) REFERENCES `datasets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
