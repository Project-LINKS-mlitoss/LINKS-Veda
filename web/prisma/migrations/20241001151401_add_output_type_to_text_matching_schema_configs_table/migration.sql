/*
  Warnings:

  - Added the required column `output_type` to the `text_matching_schema_configs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `text_matching_schema_configs` ADD COLUMN `output_type` VARCHAR(25) NOT NULL after `right_schema_id`;
