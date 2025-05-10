/*
  Warnings:

  - You are about to drop the column `setting_json` on the `templates` table. All the data in the column will be lost.
  - Added the required column `config_json` to the `templates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `templates` DROP COLUMN `setting_json`,
    ADD COLUMN `config_json` JSON NOT NULL;
