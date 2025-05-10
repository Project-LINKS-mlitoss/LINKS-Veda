-- CreateTable
CREATE TABLE `workflows` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;

-- CreateTable
CREATE TABLE `workflow_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workflow_id` INTEGER NOT NULL,
    `step` INTEGER NOT NULL,
    `operator_type` VARCHAR(191) NOT NULL,
    `config_json` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;

-- CreateTable
CREATE TABLE `workflow_detail_executions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workflow_detail_id` INTEGER NOT NULL,
    `execution_uuid` VARCHAR(191) NOT NULL,
    `step` INTEGER NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `operator_id` INTEGER NULL,
    `operator_type` VARCHAR(191) NOT NULL,
    `config_json` JSON NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;

-- AddForeignKey
ALTER TABLE `workflow_details` ADD CONSTRAINT `workflow_details_workflow_id_fkey` FOREIGN KEY (`workflow_id`) REFERENCES `workflows`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_detail_executions` ADD CONSTRAINT `workflow_detail_executions_workflow_detail_id_fkey` FOREIGN KEY (`workflow_detail_id`) REFERENCES `workflow_details`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
