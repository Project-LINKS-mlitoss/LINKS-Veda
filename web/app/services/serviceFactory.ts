import { AccountManagementRepository } from "~/repositories/accountManagementRepository";
import { AssetRepository } from "~/repositories/assetRepository";
import { ContentAssetCreationLogRepository } from "~/repositories/contentAssetCreationLogRepository";
import { ContentChatRepository } from "~/repositories/contentChatRepository";
import { ContentManagementRepository } from "~/repositories/contentManagementRepository";
import { ContentMetadataRepository } from "~/repositories/contentMetadataRepository";
import { ContentRepository } from "~/repositories/contentRepository";
import { ContentVisualizesRepository } from "~/repositories/contentVisualizesRepository";
import { DatasetContentManagementRepository } from "~/repositories/datasetContentManagementRepository";
import { DatasetRepository } from "~/repositories/datasetRepository";
import { GSpatialRepository } from "~/repositories/gSpatialRepository";
import { ItemsRepository } from "~/repositories/itemsRepository";
import { MbRepository } from "~/repositories/mbRepository";
import { OperatorsRepository } from "~/repositories/operatorsRepository";
import { ProcessingStatusRepository } from "~/repositories/processingStatusRepository";
import { ResourcePermissionRepository } from "~/repositories/resourcePermissionRepository";
import { StorageRepository } from "~/repositories/storageRepository";
import { TemplatesRepository } from "~/repositories/templatesRepository";
import { UseCase13Repository } from "~/repositories/useCase13Repository";
import { UseCase19Repository } from "~/repositories/useCase19Repository";
import { UseCaseRepository } from "~/repositories/useCaseRepository";
import { UserRepository } from "~/repositories/userRepository";
import { WorkflowDetailExecutionRepository } from "~/repositories/workflowDetailExecutionRepository";
import { AssetService } from "~/services/assetService";
import { ContentService } from "~/services/contentService";
import { ItemsService } from "~/services/itemsService";
import { OperatorsService } from "~/services/operatorService";
import { ChatService } from "./chatService";
import { DatasetService } from "./datasetService";
import { ProcessingStatusService } from "./processingStatusService";
import { TemplatesService } from "./templatesService";
import { UseCase13Service } from "./useCase13Service";
import { UseCase19Service } from "./useCase19Service";
import { UseCaseService } from "./useCaseService";
import { UserService } from "./userService";

export class ServiceFactory {
	private constructor() {}

	private static userServiceInstance: UserService;
	private static contentServiceInstance: ContentService;
	private static chatServiceInstance: ChatService;
	private static itemServiceInstance: ItemsService;
	private static assetServiceInstance: AssetService;
	private static operatorServiceInstance: OperatorsService;
	private static processingStatusServiceInstance: ProcessingStatusService;
	private static templatesServiceInstance: TemplatesService;
	private static datasetServiceInstance: DatasetService;
	private static uc13ServiceInstance: UseCase13Service;
	private static uc19ServiceInstance: UseCase19Service;
	private static useCaseServiceInstance: UseCaseService;

	static getUserService(): UserService {
		if (!ServiceFactory.userServiceInstance) {
			ServiceFactory.userServiceInstance = new UserService(
				new UserRepository(),
				new AccountManagementRepository(),
				new UseCaseRepository(),
			);
		}

		return ServiceFactory.userServiceInstance;
	}

	static getContentService(): ContentService {
		if (!ServiceFactory.contentServiceInstance) {
			ServiceFactory.contentServiceInstance = new ContentService(
				new ContentRepository(),
				new ResourcePermissionRepository(),
				new ContentManagementRepository(),
				new ContentChatRepository(),
				new ContentVisualizesRepository(),
				new GSpatialRepository(),
				new MbRepository(),
				new DatasetContentManagementRepository(),
				new AccountManagementRepository(),
				new ContentAssetCreationLogRepository(),
				new ContentMetadataRepository(),
				new WorkflowDetailExecutionRepository(),
			);
		}

		return ServiceFactory.contentServiceInstance;
	}

	static getChatService(): ChatService {
		if (!ServiceFactory.chatServiceInstance) {
			ServiceFactory.chatServiceInstance = new ChatService(
				new ContentChatRepository(),
				new ContentRepository(),
				new AccountManagementRepository(),
				new MbRepository(),
			);
		}

		return ServiceFactory.chatServiceInstance;
	}

	static getItemService(): ItemsService {
		if (!ServiceFactory.itemServiceInstance) {
			ServiceFactory.itemServiceInstance = new ItemsService(
				new ItemsRepository(),
			);
		}

		return ServiceFactory.itemServiceInstance;
	}

	static getAssetService(): AssetService {
		if (!ServiceFactory.assetServiceInstance) {
			ServiceFactory.assetServiceInstance = new AssetService(
				new AssetRepository(),
				new StorageRepository(),
				new ResourcePermissionRepository(),
				new OperatorsRepository(),
				new AccountManagementRepository(),
			);
		}

		return ServiceFactory.assetServiceInstance;
	}

	static getOperatorService(): OperatorsService {
		if (!ServiceFactory.operatorServiceInstance) {
			ServiceFactory.operatorServiceInstance = new OperatorsService(
				new OperatorsRepository(),
				new MbRepository(),
				new ResourcePermissionRepository(),
				new ContentRepository(),
				new WorkflowDetailExecutionRepository(),
				new TemplatesRepository(),
			);
		}

		return ServiceFactory.operatorServiceInstance;
	}

	static getProcessingStatusService(): ProcessingStatusService {
		if (!ServiceFactory.processingStatusServiceInstance) {
			ServiceFactory.processingStatusServiceInstance =
				new ProcessingStatusService(
					new ProcessingStatusRepository(),
					new AssetRepository(),
					new ContentRepository(),
					new MbRepository(),
					new ResourcePermissionRepository(),
					new AccountManagementRepository(),
				);
		}

		return ServiceFactory.processingStatusServiceInstance;
	}

	static getTemplateService(): TemplatesService {
		if (!ServiceFactory.templatesServiceInstance) {
			ServiceFactory.templatesServiceInstance = new TemplatesService(
				new TemplatesRepository(),
			);
		}

		return ServiceFactory.templatesServiceInstance;
	}

	static getDatasetService(): DatasetService {
		if (!ServiceFactory.datasetServiceInstance) {
			ServiceFactory.datasetServiceInstance = new DatasetService(
				new DatasetRepository(),
				new DatasetContentManagementRepository(),
				new GSpatialRepository(),
				new ContentRepository(),
				new MbRepository(),
			);
		}

		return ServiceFactory.datasetServiceInstance;
	}

	static getUseCase13Service(): UseCase13Service {
		if (!ServiceFactory.uc13ServiceInstance) {
			ServiceFactory.uc13ServiceInstance = new UseCase13Service(
				new UseCase13Repository(),
			);
		}

		return ServiceFactory.uc13ServiceInstance;
	}

	static getUseCase19Service(): UseCase19Service {
		if (!ServiceFactory.uc19ServiceInstance) {
			ServiceFactory.uc19ServiceInstance = new UseCase19Service(
				new UseCase19Repository(),
			);
		}

		return ServiceFactory.uc19ServiceInstance;
	}

	static getUseCaseService(): UseCaseService {
		if (!ServiceFactory.useCaseServiceInstance) {
			ServiceFactory.useCaseServiceInstance = new UseCaseService(
				new UseCaseRepository(),
			);
		}

		return ServiceFactory.useCaseServiceInstance;
	}
}
