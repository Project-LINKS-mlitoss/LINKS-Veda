/*
  Warnings:

  - You are about to drop the column `accidentSummary` on the `UC16UFN002Setting` table. All the data in the column will be lost.
  - You are about to drop the column `activeAccidentType` on the `UC16UFN002Setting` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `UC16UFN002Setting` table. All the data in the column will be lost.
  - You are about to drop the column `higher_lower` on the `UC16UFN002Setting` table. All the data in the column will be lost.
  - You are about to drop the column `objectiveCompensationAmount` on the `UC16UFN002Setting` table. All the data in the column will be lost.
  - You are about to drop the column `personalCompensationAmount` on the `UC16UFN002Setting` table. All the data in the column will be lost.
  - You are about to drop the column `prefecture` on the `UC16UFN002Setting` table. All the data in the column will be lost.
  - You are about to drop the column `slower_faster` on the `UC16UFN002Setting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `UC16UFN002Setting` DROP COLUMN `accidentSummary`,
    DROP COLUMN `activeAccidentType`,
    DROP COLUMN `city`,
    DROP COLUMN `higher_lower`,
    DROP COLUMN `objectiveCompensationAmount`,
    DROP COLUMN `personalCompensationAmount`,
    DROP COLUMN `prefecture`,
    DROP COLUMN `slower_faster`,
    ADD COLUMN `accidentType` VARCHAR(191) NULL,
    ADD COLUMN `aircraftCollision` VARCHAR(191) NULL,
    ADD COLUMN `category` VARCHAR(191) NULL,
    ADD COLUMN `duration` VARCHAR(191) NULL,
    ADD COLUMN `fireInFlight` VARCHAR(191) NULL,
    ADD COLUMN `lossOfControl` VARCHAR(191) NULL,
    ADD COLUMN `personalInjury` VARCHAR(191) NULL,
    ADD COLUMN `reportSummary` TEXT NULL,
    ADD COLUMN `riskOfCollision` VARCHAR(191) NULL,
    ADD COLUMN `thirdPartyDamage` VARCHAR(191) NULL,
    ADD COLUMN `variousRegions` VARCHAR(191) NULL,
    MODIFY `modalName` TEXT NULL,
    MODIFY `kind` TEXT NULL;
