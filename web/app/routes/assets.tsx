import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import {
	json,
	useActionData,
	useLoaderData,
	useNavigation,
	useSubmit,
} from "@remix-run/react";
import { PromisePool } from "@supercharge/promise-pool";
import axios, { type AxiosProgressEvent } from "axios";
import pako from "pako";
import { useEffect, useState } from "react";
import { deleteAction, uploadAction } from "~/actions/AssetAction";
import jp from "~/commons/locales/jp";
import type { UploadFile } from "~/components/atoms/Upload";
import AssetsPage from "~/components/pages/Assets";
import { assetLoader } from "~/loaders/AssetLoader";
import {
	type AssetsResponse,
	type FileType,
	UploadIntent,
	type UploadQueueItem,
	type UploadResponse,
	UploadStatus,
	UploadingFormStatus,
} from "~/models/asset";
import type { ApiResponse } from "~/repositories/utils";
import { getUserInfo } from "../../server/cookie.server";

export const ACTION_TYPES_ASSETS = {
	DELETE: "delete",
	UPLOAD: "upload",
};

export const meta: MetaFunction = () => {
	return [{ title: "Assets" }, { name: "Assets", content: "" }];
};

export { assetLoader as loader };
export async function action({ request }: ActionFunctionArgs) {
	const formData = new URLSearchParams(await request.text());
	const _action = formData.get("_action");
	const { uid, username } = await getUserInfo(request);
	formData.append("uid", uid);
	formData.append("username", username);
	switch (_action) {
		case ACTION_TYPES_ASSETS.UPLOAD: {
			return uploadAction(formData);
		}
		case ACTION_TYPES_ASSETS.DELETE: {
			return deleteAction(formData);
		}
		default: {
			return json(
				{ status: false, error: jp.message.common.invalidActionType },
				{ status: 400 },
			);
		}
	}
}

export default function Assets() {
	//handle upload
	const submit = useSubmit();
	const actionData = useActionData<UploadResponse>();

	const navigation = useNavigation();
	const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
	const [formStatus, setFormStatus] = useState(UploadingFormStatus.None);

	useEffect(() => {
		if (
			uploadQueue &&
			uploadQueue.length > 0 &&
			formStatus === UploadingFormStatus.Uploading
		) {
			let uploading = false;
			let isFailed = false;
			uploadQueue.forEach((item, _) => {
				if (item.status === UploadStatus.Uploading) {
					uploading = true;
					return;
				}
				if (item.status === UploadStatus.Failure) {
					isFailed = true;
					return;
				}
			});
			if (uploading) {
				setFormStatus(UploadingFormStatus.Uploading);
			} else if (!isFailed) {
				createAssets();
				setFormStatus(UploadingFormStatus.Complete);
			}
		} else {
			setFormStatus(UploadingFormStatus.None);
		}
	}, [uploadQueue, formStatus]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: ignore queue changes
	useEffect(() => {
		if (actionData && navigation.state === "idle") {
			if (actionData) {
				const { intent, data } = actionData;
				if (intent === UploadIntent.requestSignedUrls) {
					setFormStatus(UploadingFormStatus.Uploading);
					const queue = [...uploadQueue];
					queue.forEach((item, _) => {
						const filteredItems = data?.filter(
							(dataItem) => dataItem.uid === item.uid,
						);
						if (filteredItems && filteredItems.length > 0) {
							item.signedUrl = filteredItems[0].signedUrl;
							item.token = filteredItems[0].token;
							item.contentType = filteredItems[0].contentType;
							item.contentEncoding = filteredItems[0].contentEncoding;
							item.status = UploadStatus.Uploading;
						}
					});
					setUploadQueue(queue);
					executeQueue();
				} else if (intent === UploadIntent.createAsset) {
					const item = data ? data[0] : undefined;
					const queue = [...uploadQueue];
					queue.forEach((uploadItem, _) => {
						if (uploadItem.uid === item?.uid) {
							uploadItem.status = UploadStatus.AssetCreated;
							return;
						}
					});
					setUploadQueue(queue);
				}
			}
		}
	}, [actionData, navigation.state]);

	const handleSubmit = (fileList: UploadFile[]) => {
		const queueItems = Array.from(fileList).map(
			(item: UploadFile, index: number) => ({
				uid: item.uid,
				id: index,
				signedUrl: undefined,
				file: item as FileType,
				name: item.name,
				size: item.size ?? 0,
				status: UploadStatus.Waiting,
				token: undefined,
				uploadProgress: 0,
			}),
		);

		setUploadQueue(queueItems);

		const formData = new FormData();
		formData.append("_action", ACTION_TYPES_ASSETS.UPLOAD);
		formData.append("intent", "requestSignedUrls");
		formData.append("items", JSON.stringify(queueItems));

		submit(formData, { method: "post" });
	};

	const handleCancel = () => {
		setFormStatus(UploadingFormStatus.None);
	};

	const executeQueue = () => {
		PromisePool.withConcurrency(5)
			.for(uploadQueue)
			.process(async (item) => {
				uploadSingleItem(item);
			});
	};

	const uploadSingleItem = async (item: UploadQueueItem) => {
		const url = item.signedUrl;
		if (url) {
			const fileBuffer = await item.file.arrayBuffer();
			const gzippedData = pako.gzip(new Uint8Array(fileBuffer));
			const gzippedBlob = new Blob([gzippedData], { type: "application/gzip" });

			const config = {
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Content-Type": item.contentType || "application/octet-stream",
					"Content-Encoding": item.contentEncoding || "gzip",
				},
				onUploadProgress: (progressEvent: AxiosProgressEvent) => {
					if (progressEvent.total) {
						const percentCompleted = Math.round(
							(progressEvent.loaded * 100) / progressEvent.total,
						);

						const queue = [...uploadQueue];
						queue.forEach((uploadItem, _) => {
							if (uploadItem.uid === item.uid) {
								uploadItem.uploadProgress = percentCompleted;
								uploadItem.status = UploadStatus.Uploading;
								return;
							}
						});
						setUploadQueue(queue);
					}
				},
			};

			await axios
				.put(url, gzippedBlob, config)
				.then((response) => {
					const queue = [...uploadQueue];
					queue.forEach((uploadItem, _) => {
						if (uploadItem.uid === item.uid) {
							uploadItem.status = UploadStatus.Success;
							return;
						}
					});
					setUploadQueue(queue);
				})
				.catch((e) => {
					console.log("axios error", e);
					const queue = [...uploadQueue];
					queue.forEach((uploadItem, _) => {
						if (uploadItem.uid === item.uid) {
							uploadItem.status = UploadStatus.Failure;
							return;
						}
					});
					setUploadQueue(queue);
				});
		}
	};

	const createAssets = () => {
		const formData = new FormData();
		formData.append("_action", ACTION_TYPES_ASSETS.UPLOAD);
		formData.append("intent", "createAsset");
		const items = uploadQueue.filter(
			(item) => item.status !== UploadStatus.Failure,
		);
		formData.append("items", JSON.stringify(items));

		submit(formData, { method: "post" });
	};

	// assets list
	const result = useLoaderData<ApiResponse<AssetsResponse>>();

	if (!result.status) {
		return <div>Error: {result.error}</div>;
	}

	return (
		<AssetsPage
			data={result.data}
			onUpload={handleSubmit}
			onCancel={handleCancel}
			queueList={uploadQueue}
			formStatus={formStatus}
		/>
	);
}
