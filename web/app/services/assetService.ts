import fs from "node:fs";
import path from "node:path";
import { json } from "@remix-run/node";
import pako from "pako";
import {
	RESOURCE_PERMISSION_ROLE,
	RESOURCE_PERMISSION_TYPE,
} from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import { DefaultCurrent, DefaultPageSize } from "~/components/molecules/Common";
import { logger } from "~/logger";
import {
	type AssetParams,
	type AssetsResponse,
	type CreateAssetResponse,
	type GenerateSigndUrlResponse,
	type UploadQueueItem,
	UploadStatus,
} from "~/models/asset";
import type { Content } from "~/models/content";
import type { ResourcePermissionI } from "~/models/resourcePermissionModel";
import type { AccountManagementRepository } from "~/repositories/accountManagementRepository";
import type { AssetRepository } from "~/repositories/assetRepository";
import type { OperatorsRepository } from "~/repositories/operatorsRepository";
import type { ResourcePermissionRepository } from "~/repositories/resourcePermissionRepository";
import type { StorageRepository } from "~/repositories/storageRepository";
import {
	type ApiResponse,
	GENERAL_ERROR_MESSAGE,
	type SuccessResponse,
} from "~/repositories/utils";
import { validate } from "./utils";

export class AssetService {
	private assetRepository: AssetRepository;
	private storageRepository: StorageRepository;
	private resourcePermissionRepository: ResourcePermissionRepository;
	private operatorsRepository: OperatorsRepository;
	private accountManagementRepository: AccountManagementRepository;

	constructor(
		assetRepository: AssetRepository,
		storageRepository: StorageRepository,
		resourcePermissionRepository: ResourcePermissionRepository,
		operatorsRepository: OperatorsRepository,
		accountManagementRepository: AccountManagementRepository,
	) {
		this.assetRepository = assetRepository;
		this.storageRepository = storageRepository;
		this.resourcePermissionRepository = resourcePermissionRepository;
		this.operatorsRepository = operatorsRepository;
		this.accountManagementRepository = accountManagementRepository;
	}

	async listAssets(params: AssetParams, userId: string) {
		const isAdminRole =
			await this.accountManagementRepository.isRoleAdmin(userId);
		let result = null;
		if (isAdminRole || params.keyword) {
			result = await this.getAssetByAdminRole(params);
		} else {
			result = await this.getAssetByUserRole(params, userId);
		}
		if (result.status) {
			const assets = (result as SuccessResponse<AssetsResponse>).data.items;
			const assetIds = (
				result as SuccessResponse<AssetsResponse>
			).data.items.map((asset) => asset.id);
			let resourcePermissionMap: Map<string, ResourcePermissionI> | undefined;
			if ("resourcePermissionMap" in result && result.resourcePermissionMap) {
				resourcePermissionMap = result.resourcePermissionMap;
			} else {
				const filterConditions: Record<string, unknown> = {
					resourceId: { in: assetIds },
					resourceType: RESOURCE_PERMISSION_TYPE.ASSET,
					deletedAt: null,
				};

				const resourcePermissions =
					await this.resourcePermissionRepository.find(filterConditions, {
						username: true,
						resourceId: true,
					});
				resourcePermissionMap = new Map(
					resourcePermissions.map((resource: ResourcePermissionI) => [
						resource.resourceId,
						resource,
					]),
				);
			}
			for (const asset of assets) {
				const resource = resourcePermissionMap.get(asset.id);
				if (resource) {
					asset.createdBy = resource.username;
				}
			}
		}
		return json(result);
	}

	async getAssetByAdminRole(params: AssetParams) {
		return await this.assetRepository.getAssets(params);
	}

	async getAssetByUserRole(params: AssetParams, userId: string) {
		const conditions = {
			resourceType: RESOURCE_PERMISSION_TYPE.ASSET,
			deletedAt: null,
			userId: userId,
		};
		const select = {
			resourceId: true,
			username: true,
		};
		const paginate = await this.resourcePermissionRepository.paginate(
			select,
			params,
			conditions,
		);

		if (!paginate.status) {
			return {
				status: false,
				error: paginate.error,
			};
		}

		const resources = paginate?.data?.models ?? [];
		const resourcePermissionMap: Map<string, ResourcePermissionI> = new Map(
			resources.map((resource: ResourcePermissionI) => [
				resource.resourceId,
				resource,
			]),
		);

		const assetIds = Array.from(resourcePermissionMap.keys());
		const assets = (
			await Promise.all(
				assetIds.map(async (assetId) => {
					const assetDetail =
						await this.assetRepository.getAssetDetail(assetId);
					return assetDetail.status ? assetDetail.data : null;
				}),
			)
		).filter((asset) => asset !== null);

		const data = paginate.data
			? {
					...paginate.data,
					items: assets,
				}
			: {
					items: assets,
					page: DefaultCurrent,
					perPage: DefaultPageSize,
					totalCount: 0,
				};

		return {
			status: true,
			data: data,
			resourcePermissionMap: resourcePermissionMap,
		};
	}

	async getAssetDetail(assetId: string, userId: string) {
		const validationError = validate(
			!assetId,
			jp.message.asset.assetIDRequired,
		);
		if (validationError) {
			return validationError;
		}
		const isAdminRole = await this.accountManagementRepository.isRoleAdmin(
			userId ?? "",
		);
		if (!isAdminRole) {
			const resourcePermissions =
				await this.resourcePermissionRepository.findFirst(
					{
						resourceId: assetId,
						resourceType: RESOURCE_PERMISSION_TYPE.ASSET,
						userId: userId,
						deletedAt: null,
					},
					{
						username: true,
						resourceId: true,
					},
				);
			if (!resourcePermissions)
				return json({
					status: false,
					error: jp.message.asset.requestedAssetNotAvailable,
				});
		}
		const result = await this.assetRepository.getAssetDetail(assetId);
		return json(result);
	}

	async deleteAsset(
		assetId: string,
		userUid: string,
	): Promise<ApiResponse<null>> {
		try {
			const validationError = validate(
				!assetId,
				jp.message.asset.assetIDRequired,
			);
			if (validationError) {
				return validationError;
			}
			const result = await this.assetRepository.deleteAsset(assetId);
			if (result.status) {
				await this.resourcePermissionRepository.deleteByConditions({
					userId: userUid,
					resourceType: RESOURCE_PERMISSION_TYPE.ASSET,
					resourceId: assetId,
				});
			}

			return result;
		} catch (e) {
			logger.error({
				message: jp.message.asset.deleteAssetFailed(assetId),
				err: e,
			});
			return Promise.resolve({
				status: false,
				error: jp.message.asset.unableDeleteAsset,
			});
		}
	}

	async deleteAssets(assetIds: string[], userUid: string) {
		const validationError = validate(
			assetIds.length === 0,
			"Asset IDs are required",
		);
		if (validationError) {
			return validationError;
		}

		const deletionResults: Array<{
			status: boolean;
			id: string;
			error?: string;
		}> = [];

		for (const id of assetIds) {
			try {
				const result = await this.deleteAsset(id, userUid);

				if (!result.status) {
					logger.error({
						message: `Failed to delete asset with ID ${id}`,
						err: result.error,
					});
					deletionResults.push({
						status: false,
						id,
						error: result.error,
					});
					continue;
				}

				logger.info({
					message: `Successfully deleted asset with ID ${id}`,
				});

				deletionResults.push({
					status: true,
					id,
				});
			} catch (error) {
				logger.error({
					message: `Error deleting asset with ID ${id}`,
					err: error,
				});
				deletionResults.push({
					status: false,
					id,
					error: GENERAL_ERROR_MESSAGE,
				});
			}
		}

		const failedDeletions = deletionResults.filter((result) => !result.status);

		if (failedDeletions.length > 0) {
			logger.error("Some assets failed to be deleted.");
			return json(
				{
					status: false,
					error: jp.message.asset.failedDeleteSomeAssets,
					details: failedDeletions,
				},
				{ status: 500 },
			);
		}

		logger.info("All assets were successfully deleted.");
		return json({ status: true, data: null });
	}

	async generateSignedUrls(
		items: UploadQueueItem[],
	): Promise<GenerateSigndUrlResponse> {
		if (!items.length) throw new Error("Files are empty");

		const listOfPromises: Promise<UploadQueueItem>[] = [];
		items.forEach((item, _) => {
			const { name, size } = item;
			const uploadPromise: Promise<UploadQueueItem> = new Promise(
				(resolve, reject) => {
					this.assetRepository
						.prepareUpload(name, size)
						.then((gcsModel) => {
							item.token = gcsModel.token;
							if (process.env.NODE_ENV === "development") {
								//generate signed url manually
								this.storageRepository
									.generateSignedUrl(item.name)
									.then((signedUrl) => {
										item.signedUrl = signedUrl[0];
										item.contentType = "application/octet-stream";
										resolve(item);
									})
									.catch((e) => {
										console.log("storageRepository error", e);
										item.status = UploadStatus.Failure;
										resolve(item);
									});
							} else {
								item.signedUrl = gcsModel.url;
								item.contentType = gcsModel.contentType;
								item.contentEncoding = gcsModel.contentEncoding;
								resolve(item);
							}
						})
						.catch((e) => {
							item.token = undefined;
							item.signedUrl = undefined;
							item.contentType = undefined;
							item.contentEncoding = undefined;
							item.status = UploadStatus.Failure;
							resolve(item);
						});
				},
			);
			listOfPromises.push(uploadPromise);
		});

		return Promise.allSettled(listOfPromises).then((promises) => {
			const data: UploadQueueItem[] = [];
			promises.map((result) => {
				if (result.status === "fulfilled") {
					data.push(result.value);
				}
			});

			return Promise.resolve({ success: true, items: data });
		});
	}

	async createAsset(
		model: UploadQueueItem,
		userUid: string,
		username: string,
		isCreateResourcePermission = true,
	): Promise<CreateAssetResponse> {
		try {
			const { signedUrl, token } = model;
			if (signedUrl && token) {
				const cleanedUrl = signedUrl.split("?")[0];
				const response = await this.assetRepository.createAsset(
					cleanedUrl,
					token,
					false,
				);
				if (response) {
					if (!isCreateResourcePermission)
						return Promise.resolve({
							success: true,
							error: undefined,
							asset: response,
						});

					const data = [
						{
							userId: userUid,
							username: username,
							resourceType: RESOURCE_PERMISSION_TYPE.ASSET,
							resourceId: response.id,
							role: RESOURCE_PERMISSION_ROLE.EDIT,
						},
					];
					const operatorResult =
						await this.operatorsRepository.createGeoJsonAssetContent(
							response,
							userUid,
							username,
						);
					if (operatorResult?.status) {
						data.push({
							userId: userUid,
							username: username,
							resourceType: RESOURCE_PERMISSION_TYPE.CONTENT,
							resourceId: (operatorResult as SuccessResponse<Content>)?.data.id,
							role: RESOURCE_PERMISSION_ROLE.EDIT,
						});
					}
					await this.resourcePermissionRepository.createMany(data);
					return Promise.resolve({
						success: true,
						error: undefined,
						asset: response,
					});
				}
			}
			return Promise.resolve({
				success: false,
				error: jp.message.asset.unableCreateAsset,
			});
		} catch (e) {
			logger.error({
				message: "Create asset failed",
				err: e,
			});
			return Promise.resolve({
				success: false,
				error: jp.message.asset.unableCreateAsset,
			});
		}
	}

	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	async uploadFileSignedUrl(item: UploadQueueItem): Promise<any> {
		const TEMP_FILE_DIR = process.env.VITE_TMP_PATH || "tmp";
		const tempFilePath = path.join(TEMP_FILE_DIR, `${item.name}.gz`);

		try {
			if (!item.signedUrl) {
				return { success: false, error: jp.message.asset.singedURLNotFound };
			}

			const fileBuffer = await item.file.arrayBuffer();
			const gzippedData = pako.gzip(new Uint8Array(fileBuffer));

			await fs.promises.writeFile(tempFilePath, Buffer.from(gzippedData));

			const headers: HeadersInit = {
				"Content-Type": item.contentType || "application/octet-stream",
				"Content-Encoding": item.contentEncoding || "gzip",
				"Access-Control-Allow-Origin": "*",
			};

			const requestOptions: RequestInit = {
				method: "PUT",
				headers,
				body: await fs.promises.readFile(tempFilePath),
			};

			const response = await fetch(item.signedUrl, requestOptions);

			if (!response.ok) {
				throw new Error(`Upload failed with status: ${response.status}`);
			}

			return { success: true };
		} catch (e) {
			console.log("Upload file to signed URL failed", item, e);
			return { success: false, error: jp.message.asset.unableUploadFile };
		} finally {
			try {
				await fs.promises.unlink(tempFilePath);
			} catch (err) {
				console.warn("Failed to delete temporary file:", err);
			}
		}
	}
}
