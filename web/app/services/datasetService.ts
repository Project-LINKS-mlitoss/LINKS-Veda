import fs from "node:fs";
import path from "node:path";
import { blob } from "node:stream/consumers";
import { json } from "@remix-run/node";
import { CONTENT_MANAGEMENT_PUBLISH } from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import type { Field } from "~/components/pages/Dataset/types";
import { logger } from "~/logger";
import type { Asset, UploadQueueItem } from "~/models/asset";
import type { ContentItem, ContentResponse } from "~/models/content";
import type {
	DatasetContentManagementT,
	DatasetParams,
	DatasetT,
	SaveDatasetDatabaseT,
} from "~/models/dataset";
import type { DatasetContentManagementI } from "~/models/datasetContentManagementModel";
import type { UserInfo } from "~/models/userModel";
import { prisma } from "~/prisma";
import type { ContentRepository } from "~/repositories/contentRepository";
import type { DatasetContentManagementRepository } from "~/repositories/datasetContentManagementRepository";
import type { DatasetRepository } from "~/repositories/datasetRepository";
import type { GSpatialRepository } from "~/repositories/gSpatialRepository";
import type {
	ConvertToRDFResponse,
	MbRepository,
} from "~/repositories/mbRepository";
import {
	type ApiResponse,
	GENERAL_ERROR_MESSAGE,
	type SuccessResponse,
} from "~/repositories/utils";
import { ServiceFactory } from "./serviceFactory";
import { validate } from "./utils";

export class DatasetService {
	private datasetsRepository: DatasetRepository;
	private datasetContentManagementRepository: DatasetContentManagementRepository;
	private gSpatialRepository: GSpatialRepository;
	private contentRepository: ContentRepository;
	private mbRepository: MbRepository;

	constructor(
		datasetsRepository: DatasetRepository,
		datasetContentManagementRepository: DatasetContentManagementRepository,
		gSpatialRepository: GSpatialRepository,
		contentRepository: ContentRepository,
		mbRepository: MbRepository,
	) {
		this.datasetsRepository = datasetsRepository;
		this.datasetContentManagementRepository =
			datasetContentManagementRepository;
		this.gSpatialRepository = gSpatialRepository;
		this.contentRepository = contentRepository;
		this.mbRepository = mbRepository;
	}

	async getListDataset(params: DatasetParams) {
		const datasetsResult = await this.datasetsRepository.fetchDataset(params);

		if (datasetsResult?.status) {
			const updatedData = await Promise.all(
				datasetsResult.data.data.map(async (dataset: DatasetT) => {
					const contents = dataset?.datasetContentManagements
						? await Promise.all(
								dataset.datasetContentManagements.map(
									async (item: DatasetContentManagementT) => {
										const content =
											await this.contentRepository.getContentDetail(
												item?.contentId as string,
											);

										return content?.status ? content.data : null;
									},
								),
							)
						: [];

					const validContents = contents.filter((content) => content !== null);

					const contentService = ServiceFactory.getContentService();
					const contentsResponse = await contentService.processContents({
						status: true,
						data: { models: validContents },
					} as unknown as SuccessResponse<ContentResponse>);

					return {
						...dataset,
						contents: contentsResponse || [],
					};
				}),
			);

			return json({
				...datasetsResult,
				data: {
					data: updatedData,
					totalCount: datasetsResult.data.totalCount,
				},
			});
		}

		return json(datasetsResult);
	}

	async getDetailDataset(datasetId: number) {
		const validationError = validate(
			!datasetId,
			jp.message.dataset.datasetIdRequired,
		);
		if (validationError) {
			return validationError;
		}

		const datasetResult =
			await this.datasetsRepository.getDetailDataset(datasetId);

		if (datasetResult?.status) {
			const contents = datasetResult.data?.datasetContentManagements
				? await Promise.all(
						datasetResult.data.datasetContentManagements.map(
							async (item: DatasetContentManagementT) => {
								const content = await this.contentRepository.getContentDetail(
									item?.contentId as string,
								);

								return content?.status ? content.data : null;
							},
						),
					)
				: [];

			const validContents = contents.filter((content) => content !== null);

			const contentService = ServiceFactory.getContentService();
			const contentsResponse = await contentService.processContents({
				status: true,
				data: { models: validContents },
			} as unknown as SuccessResponse<ContentResponse>);

			return json({
				...datasetResult,
				data: {
					...datasetResult.data,
					contents: contentsResponse || [],
				},
			});
		}

		return json(datasetResult);
	}

	async deleteDatasets(datasetIds: number[]): Promise<ApiResponse<null>> {
		try {
			const validationError = validate(
				!datasetIds || datasetIds.length === 0,
				jp.message.dataset.datasetIdRequired,
			);
			if (validationError) {
				return validationError;
			}

			const datasets = await this.datasetsRepository.find({
				id: { in: datasetIds },
			});

			if (!datasets || datasets.length === 0) {
				return {
					status: false,
					error: jp.message.dataset.datasetNotFound,
				};
			}

			// Delete packages and datasets in parallel
			const deletePromises = datasets.map(async (dataset: DatasetT) => {
				try {
					// Delete package if exists
					if (dataset.packageId) {
						await this.gSpatialRepository.deletePackage(dataset.packageId);
						logger.info({
							message: `Package with ID ${dataset.packageId} deleted successfully`,
						});
					}

					// Delete dataset
					const result = await this.datasetsRepository.deleteDataset(
						dataset.id,
					);
					if (!result.status) {
						throw new Error(result.error);
					}
					logger.info({
						message: `Dataset with ID ${dataset.id} deleted successfully`,
					});
					return { status: true, id: dataset.id };
				} catch (error) {
					logger.error({
						message: `Failed to delete dataset ${dataset.id}`,
						err: error,
					});
					return { status: false, id: dataset.id, error };
				}
			});

			const results = await Promise.all(deletePromises);
			const failedDeletions = results.filter((result) => !result.status);

			if (failedDeletions.length > 0) {
				const failedIds = failedDeletions.map((result) => result.id).join(", ");
				return {
					status: false,
					error: `${jp.message.dataset.deleteDatasetFailed} (IDs: ${failedIds})`,
				};
			}

			return {
				status: true,
				data: null,
			};
		} catch (e) {
			logger.error({
				message: "Delete datasets failed",
				err: e,
			});
			return Promise.resolve({
				status: false,
				error: jp.message.dataset.deleteDatasetFailed,
			});
		}
	}

	async saveDataset(
		saveDatasetDatabase: SaveDatasetDatabaseT,
		saveDatasetContentManagementDatabase: ContentItem[],
		userUid: string,
		username: string,
	) {
		try {
			// Check if dataset name already exists
			const existingDataset = await this.datasetsRepository.find({
				name: saveDatasetDatabase.name,
			});
			if (existingDataset.length > 0) {
				logger.error({
					message: "Dataset name already exists",
					datasetName: saveDatasetDatabase.name,
				});
				return {
					status: false,
					error: jp.message.dataset.datasetNameExists,
				};
			}

			// Create in dataset
			const savedDataset =
				await this.datasetsRepository.create(saveDatasetDatabase);
			logger.info({
				message: "Dataset created successfully",
				datasetId: savedDataset.id,
			});

			// create in datasetContentManagement
			const contentManagementData = saveDatasetContentManagementDatabase.map(
				(item) => ({
					contentId: item.id,
					contentManagementId: item?.management
						? item?.management?.id
						: item?.duplicateContent
							? item?.duplicateContent?.id
							: 0,
					contentVisualizeId: item.visualize?.id ?? 0,
					resourceId: null,
					datasetId: savedDataset.id,
				}),
			);
			await this.datasetContentManagementRepository.createMany(
				contentManagementData,
			);
			const createdContentManagementRecords =
				await this.datasetContentManagementRepository.find({
					datasetId: savedDataset.id,
				});

			// Publish
			if (saveDatasetDatabase?.isPublish) {
				const createPackageAndResources = await this.handlePackageAndResources(
					saveDatasetDatabase,
					userUid,
					username,
					savedDataset,
					saveDatasetContentManagementDatabase,
					createdContentManagementRecords,
				);
				if (!createPackageAndResources?.status) {
					return {
						...createPackageAndResources,
						error: `${jp.message.dataset.createDatasetSuccess}, ${jp.message.common.warning} ${createPackageAndResources?.error}`,
					};
				}
			}

			return {
				status: true,
				data: savedDataset,
			};
		} catch (error) {
			logger.error({
				message: "Error saving dataset",
				err: error,
			});
			return {
				status: false,
				error: GENERAL_ERROR_MESSAGE,
			};
		}
	}

	async updateDataset(
		datasetId: number,
		saveDatasetDatabase: SaveDatasetDatabaseT,
		saveDatasetContentManagementDatabase: ContentItem[],
		userUid: string,
		username: string,
	) {
		try {
			// Check if dataset name already exists
			const existingDataset = await this.datasetsRepository.find({
				name: saveDatasetDatabase.name,
			});
			if (existingDataset.length && existingDataset[0].id !== datasetId) {
				return {
					status: false,
					error: "Dataset name already exists.",
				};
			}

			// update in dataset
			const updatedDataset: DatasetT = await this.datasetsRepository.update(
				datasetId,
				saveDatasetDatabase,
			);
			logger.info({
				message: `Dataset with ID ${datasetId} updated successfully`,
			});

			if (saveDatasetDatabase?.isPublish) {
				// delete resource in datasetContentManagements
				const datasetContentManagements =
					await this.datasetContentManagementRepository.find({
						datasetId: datasetId,
					});
				if (datasetContentManagements?.length > 0) {
					const deleteResources = datasetContentManagements?.map(
						async (datasetContentManagement: DatasetContentManagementT) => {
							try {
								if (datasetContentManagement?.resourceId) {
									const deleteResource =
										await this.gSpatialRepository.deleteResource(
											datasetContentManagement.resourceId,
										);

									logger.info({
										message: "Delete resource successfully",
										data: deleteResource,
									});
								}
							} catch (error) {
								logger.error({
									message: "Error delete resource",
									err: error,
								});
							}
						},
					);
					await Promise.all(deleteResources);
				}

				// delete resourceMarkdown
				if (updatedDataset?.resourceMarkdownId) {
					await this.gSpatialRepository.deleteResource(
						updatedDataset.resourceMarkdownId,
					);
				}

				// update in datasetContentManagement
				const createdContentManagementRecords =
					await this.updateDatasetContentManagement(
						datasetId,
						updatedDataset,
						saveDatasetContentManagementDatabase,
					);

				// Create resource or package and resource
				if (updatedDataset?.packageId) {
					const metaData = saveDatasetDatabase?.metaData as unknown as Field[];

					await this.gSpatialRepository.updatePackage(
						updatedDataset?.packageId,
						saveDatasetDatabase?.name,
						userUid,
						username,
						metaData,
					);
					await this.handleResourceCreation(
						saveDatasetContentManagementDatabase,
						updatedDataset.packageId,
						updatedDataset.id,
						createdContentManagementRecords,
					);
					await this.handleMarkdownCreation(
						metaData,
						updatedDataset.packageId,
						updatedDataset.id,
						userUid,
						username,
						updatedDataset.assetId ?? undefined,
					);
				} else {
					const createPackageAndResources =
						await this.handlePackageAndResources(
							saveDatasetDatabase,
							userUid,
							username,
							updatedDataset,
							saveDatasetContentManagementDatabase,
							createdContentManagementRecords,
						);
					if (!createPackageAndResources?.status) {
						return {
							...createPackageAndResources,
							error: `${jp.message.dataset.updateDatasetSuccess}, ${jp.message.common.warning} ${createPackageAndResources?.error}`,
						};
					}
				}
			} else {
				// delete package
				if (updatedDataset.packageId) {
					await this.gSpatialRepository.deletePackage(updatedDataset.packageId);
				}

				// remove packageId in dataset table
				await this.datasetsRepository.update(datasetId, {
					packageId: null,
				});

				// update in datasetContentManagement
				await this.updateDatasetContentManagement(
					datasetId,
					updatedDataset,
					saveDatasetContentManagementDatabase,
				);
			}

			return {
				status: true,
				data: updatedDataset,
			};
		} catch (error) {
			logger.error({
				message: `Error updating dataset with ID ${datasetId}`,
				err: error,
			});
			return {
				status: false,
				error: GENERAL_ERROR_MESSAGE,
			};
		}
	}

	async updateDatasetContentManagement(
		datasetId: number,
		updatedDataset: DatasetT,
		saveDatasetContentManagementDatabase: ContentItem[],
	) {
		try {
			// delete old
			await prisma.datasetContentManagement.deleteMany({
				where: { datasetId },
			});

			// create new
			const contentManagementData = saveDatasetContentManagementDatabase.map(
				(item) => ({
					contentId: item.id,
					contentManagementId: item?.management
						? item?.management?.id
						: item?.duplicateContent
							? item?.duplicateContent?.id
							: 0,
					contentVisualizeId: item.visualize?.id ?? 0,
					resourceId: null,
					datasetId: updatedDataset.id,
				}),
			);
			await this.datasetContentManagementRepository.createMany(
				contentManagementData,
			);
			logger.info({
				message: `DatasetContentManagement records for dataset ID ${datasetId} updated successfully`,
			});

			const createdContentManagementRecords =
				await this.datasetContentManagementRepository.find({
					datasetId: updatedDataset.id,
				});
			return createdContentManagementRecords;
		} catch (error) {
			logger.error({
				message: `Error updating DatasetContentManagement for dataset ID ${datasetId}`,
				err: error,
			});
		}
	}

	async handlePackageAndResources(
		saveDatasetDatabase: SaveDatasetDatabaseT,
		userUid: string,
		username: string,
		savedDataset: DatasetT,
		saveDatasetContentManagementDatabase: ContentItem[],
		createdContentManagementRecords: DatasetContentManagementI[],
	) {
		try {
			const metaData = saveDatasetDatabase?.metaData as unknown as Field[];

			// create package
			const createPackage = await this.gSpatialRepository.createPackage(
				saveDatasetDatabase?.name,
				userUid,
				username,
				metaData,
			);
			logger.info({
				message: `Package Veda ${saveDatasetDatabase?.name} created successfully`,
				data: createPackage,
			});

			if (createPackage?.status) {
				// update packageId to dataset
				const updatedDataset = await this.datasetsRepository.update(
					savedDataset.id,
					{
						packageId:
							createPackage?.status && "id" in createPackage
								? createPackage.id
								: undefined,
					},
				);

				// create resource if packageId exist
				if (updatedDataset?.packageId) {
					await this.handleResourceCreation(
						saveDatasetContentManagementDatabase,
						updatedDataset.packageId,
						updatedDataset.id,
						createdContentManagementRecords,
					);
					// create markdown
					await this.handleMarkdownCreation(
						metaData,
						updatedDataset.packageId,
						updatedDataset.id,
						userUid,
						username,
						updatedDataset.assetId ?? undefined,
					);
				}
			} else {
				return createPackage;
			}
		} catch (error) {
			logger.error({
				message: "Error in handling package and resources",
				err: error,
			});
		}
	}

	async handleResourceCreation(
		saveDatasetContentManagementDatabase: ContentItem[],
		createPackageId: string,
		datasetId: number,
		createdContentManagementRecords: DatasetContentManagementI[],
	) {
		const resourcesCreationPromises = createdContentManagementRecords.map(
			async (record) => {
				try {
					const content = saveDatasetContentManagementDatabase.find(
						(item) => item.id === record.contentId,
					);

					if (
						content &&
						(content?.management
							? content?.management?.status
							: content?.duplicateContent
								? content?.duplicateContent?.status
								: undefined) === CONTENT_MANAGEMENT_PUBLISH.PUBLISH
					) {
						const createResource = await this.gSpatialRepository.createResource(
							createPackageId,
							content,
						);

						logger.info({
							message: `Resource for content ${content.id} created successfully`,
							data: createResource,
						});

						if (createResource?.status) {
							await this.datasetContentManagementRepository.updateByConditions(
								{
									id: record?.id,
									contentId: content.id,
									datasetId: datasetId,
								},
								{
									resourceId: "id" in createResource ? createResource.id : null,
								},
							);
						} else {
							logger.error({
								message: `Failed to create resource for content ${content.id}`,
								err: createResource?.error,
							});
						}
					}
				} catch (error) {
					logger.error({
						message: `Error creating resource for content ${record.contentId}`,
						err: error,
					});
				}
			},
		);

		await Promise.all(resourcesCreationPromises);
	}

	async handleMarkdownCreation(
		metaData: Field[],
		createPackageId: string,
		datasetId: number,
		userUid: string,
		username: string,
		oldAssetId?: string,
	) {
		// Create file markdown
		const TEMP_FILE_DIR = process.env.VITE_TMP_PATH || "tmp";
		if (!fs.existsSync(TEMP_FILE_DIR)) {
			try {
				fs.mkdirSync(TEMP_FILE_DIR);
			} catch (err) {
				logger.error({
					message: "Failed to create temporary directory",
					err,
				});
				throw new Error("Failed to create temporary directory.");
			}
		}
		const metadataContent = [
			"### メタデータ\n",
			...(Array.isArray(metaData)
				? metaData.map((f) => `- **${f.label}**：${f.value}\n`)
				: []),
		].join("\n");

		const fileName = "metadata.md";
		const filePath = path.join(TEMP_FILE_DIR, fileName);
		try {
			fs.writeFileSync(filePath, metadataContent);

			// biome-ignore lint/suspicious/noExplicitAny: FIXME
			const file: any = await blob(fs.createReadStream(filePath));
			const fileSize = fs.statSync(filePath).size;
			const item = {
				name: fileName,
				size: fileSize,
				file: file,
			} as UploadQueueItem;

			// create asset
			const assetService = ServiceFactory.getAssetService();
			// delete old asset
			if (oldAssetId) {
				await assetService.deleteAsset(oldAssetId, userUid);
			}
			// create new asset
			const signedUrlResult = await assetService.generateSignedUrls([item]);
			const itemResult = signedUrlResult.items[0];

			if (!itemResult.signedUrl) throw new Error("Generate signed URL failed");

			await assetService.uploadFileSignedUrl(item);
			const assetResult = await assetService.createAsset(
				item,
				userUid,
				username,
			);
			if (!assetResult.success) throw new Error("Create asset failed");
			if (!assetResult?.asset?.id) {
				throw new Error("Asset ID is undefined");
			}
			const { asset } = assetResult;

			// Create resource file markdown
			const createResource = await this.gSpatialRepository.createResource(
				createPackageId,
				assetResult.asset,
				true,
			);

			logger.info({
				message: `Resource for assets ${asset.id} created successfully`,
				data: createResource,
			});

			// Update assetId and assetUrL to dataset
			if (createResource?.status) {
				await this.datasetsRepository.update(datasetId, {
					assetId: asset?.id,
					assetUrl: asset?.url,
					resourceMarkdownId: "id" in createResource ? createResource.id : null,
				});
			} else {
				logger.error({
					message: `Failed to create resource for asset ${asset.id}`,
					err: createResource?.error,
				});
			}
		} catch (err) {
			logger.error({ message: "Error in handleMarkdownCreation", err });
			throw err;
		} finally {
			if (fs.existsSync(filePath)) {
				try {
					fs.unlinkSync(filePath);
					logger.info({
						message: `Temporary file ${filePath} deleted successfully.`,
					});
				} catch (err) {
					logger.error({
						message: `Failed to delete temporary file ${filePath}`,
						err,
					});
				}
			}
		}
	}

	async convertFromXLSXToRDF(
		fileName: string,
		asset: Asset,
		user: UserInfo,
	): Promise<{ status: boolean; asset?: Asset; error?: string }> {
		const TEMP_FILE_DIR = process.env.VITE_TMP_PATH || "tmp";
		const basePath = `${TEMP_FILE_DIR}/datasets`;
		const fileNameWithoutExtension = fileName.replace(".xlsx", "");
		try {
			const validationError = validate(!asset.url, "Input file is required");
			if (validationError) {
				return validationError;
			}

			const result = await this.mbRepository.convertToRDF(asset.url);
			// If convert failed, still display the original asset
			if (!result.status)
				return {
					status: true,
					asset: asset,
				};

			if (!fs.existsSync(basePath)) {
				fs.mkdirSync(basePath, { recursive: true });
			}
			const fileNameRDF = `${fileNameWithoutExtension}.rdf`;
			const filePath = path.join(basePath, fileNameRDF);
			fs.writeFileSync(filePath, (result as ConvertToRDFResponse)?.data ?? "");
			const file = await blob(fs.createReadStream(filePath));
			const fileSize = fs.statSync(filePath).size;
			const item = {
				name: fileNameRDF,
				size: fileSize,
				file: file,
			} as UploadQueueItem;
			const assetService = ServiceFactory.getAssetService();
			const signedUrlResult = await assetService.generateSignedUrls([item]);
			const itemResult = signedUrlResult.items[0];
			if (!itemResult.signedUrl)
				return {
					status: false,
					error: jp.message.asset.generateSignedUrlFailed,
				};

			const uploadResult = await assetService.uploadFileSignedUrl(item);
			if (!uploadResult.success)
				return {
					status: false,
					error: jp.message.asset.uploadFileToSignedUrlFailed,
				};

			const assetResult = await assetService.createAsset(
				item,
				user.uid,
				user.username,
			);
			return {
				status: true,
				asset: assetResult.asset,
			};
		} catch (e) {
			console.log("Convert from XLSX to RDF failed", e);
			logger.error({
				message: `Convert from XLSX: ${asset.url} to RDF failed`,
				e,
			});
			return {
				status: false,
				error: "Failed to convert XLSX file",
			};
		} finally {
			const fileNameRdf = `${fileNameWithoutExtension}.rdf`;
			const filePath = path.join(basePath, fileNameRdf);
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}
		}
	}
}
