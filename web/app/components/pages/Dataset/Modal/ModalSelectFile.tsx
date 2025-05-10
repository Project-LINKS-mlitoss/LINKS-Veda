import { useActionData, useLocation, useSubmit } from "@remix-run/react";
import Upload, {
	type UploadFile,
	type UploadProps,
} from "app/components/atoms/Upload";
import axios, { type AxiosProgressEvent } from "axios";
import pako from "pako";
import type React from "react";
import { useEffect, useState } from "react";
import jp from "~/commons/locales/jp";
import Icon from "~/components/atoms/Icon";
import Modal from "~/components/atoms/Modal";
import { showNotification } from "~/components/molecules/Common/utils";
import type { UploadListItemProps } from "~/components/pages/Assets/types";
import { AllowTypes } from "~/components/pages/Assets/utils";
import { logger } from "~/logger";
import {
	type Asset,
	type FileType,
	UploadIntent,
	type UploadQueueItem,
	UploadStatus,
} from "~/models/asset";
import { ACTION_TYPES_DATASET } from "~/models/dataset";
import type { ApiResponse } from "~/repositories/utils";
import type { METADATA_KEY } from "../types";

const { Dragger } = Upload;

interface Props {
	isModalSelectFileOpen: boolean;
	setIsModalSelectFileOpen: (val: boolean) => void;
	editingMetadata: METADATA_KEY | undefined;
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	handleUpdateSetting: (key: string, value: any) => void;
}

const ModalSelectFile: React.FC<Props> = ({
	isModalSelectFileOpen,
	setIsModalSelectFileOpen,
	editingMetadata,
	handleUpdateSetting,
}) => {
	// Remix
	const submit = useSubmit();
	const location = useLocation();
	const fullPath = `${location.pathname}${location.search}`;
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	const actionData = useActionData<ApiResponse<any>>();

	// State
	const [selectedFile, setSelectedFile] = useState<UploadFile | null>(null);
	const [uploadQueue, setUploadQueue] = useState<UploadQueueItem>();
	const [isUploading, setIsUploading] = useState(false);

	// Reset selectedFile when modal is opened
	useEffect(() => {
		if (isModalSelectFileOpen) {
			setSelectedFile(null);
			setUploadQueue(undefined);
		}
	}, [isModalSelectFileOpen]);

	// For modal upload
	const props: UploadProps = {
		name: "file",
		beforeUpload: (file) => {
			setSelectedFile(file);
			return false;
		},
		onRemove: () => {
			setSelectedFile(null);
		},
		disabled: isUploading,
	};

	// Handle Upload file asset
	const handleUpload = () => {
		setIsUploading(true);
		if (selectedFile) {
			const item = {
				uid: selectedFile.uid,
				signedUrl: undefined,
				file: selectedFile as FileType,
				name: selectedFile.name,
				size: selectedFile.size ?? 0,
				status: UploadStatus.Uploading,
				token: undefined,
				uploadProgress: 0,
			};

			setUploadQueue(item);

			const formData = new FormData();
			formData.append("actionType", ACTION_TYPES_DATASET.UPLOADFILE);
			formData.append("intent", UploadIntent.requestSignedUrls);
			formData.append("item", JSON.stringify(item));

			submit(formData, {
				method: "post",
				action: fullPath,
				preventScrollReset: false,
			});
		}
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
						setUploadQueue((prev) => {
							if (!prev) return prev;
							return {
								...prev,
								uploadProgress: percentCompleted,
								status: UploadStatus.Uploading,
							};
						});
					}
				},
			};

			await axios
				.put(url, gzippedBlob, config)
				.then((response) => {
					setUploadQueue((prev) => {
						if (!prev) return prev;
						return {
							...prev,
							status: UploadStatus.Success,
						};
					});
					logger.info({
						message: "uploadSingleItem",
						data: JSON.stringify(response),
					});
				})
				.catch((e) => {
					setUploadQueue((prev) => {
						if (!prev) return prev;
						return {
							...prev,
							status: UploadStatus.Failure,
						};
					});
					logger.info({
						message: "generateTextMatchingAction",
						err: e,
					});
				});
		} else {
			showNotification(false, jp.message.common.uploadFailed);
			setIsUploading(false);
			setIsModalSelectFileOpen(false);
		}
	};

	const createAsset = () => {
		const formData = new FormData();
		formData.append("actionType", ACTION_TYPES_DATASET.UPLOADFILE);
		formData.append("intent", UploadIntent.createAsset);
		if (editingMetadata) formData.append("metadataKey", editingMetadata);
		formData.append("item", JSON.stringify(uploadQueue));

		submit(formData, {
			method: "post",
			action: fullPath,
			preventScrollReset: false,
		});
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (uploadQueue?.status === UploadStatus.Success) {
			createAsset();
		}
	}, [uploadQueue]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (
			actionData &&
			actionData?.actionType === ACTION_TYPES_DATASET.UPLOADFILE
		) {
			if (actionData.status === false) {
				showNotification(
					false,
					jp.message.common.uploadFailed,
					actionData.error,
				);
				setIsUploading(false);
				setIsModalSelectFileOpen(false);
			} else {
				if ("intent" in actionData && "data" in actionData) {
					const { intent, data } = actionData;
					if (intent === UploadIntent.requestSignedUrls) {
						const queue = {
							...uploadQueue,
							signedUrl: data.signedUrl,
							token: data.token,
							contentType: data.contentType,
							contentEncoding: data.contentEncoding,
							status: UploadStatus.Uploading,
						};
						setUploadQueue(queue as UploadQueueItem);
						uploadSingleItem(queue as UploadQueueItem);
					} else if (intent === UploadIntent.createAsset) {
						const asset = data as Asset;
						if (editingMetadata) {
							handleUpdateSetting(editingMetadata, asset?.url);
							localStorage.setItem(editingMetadata, asset?.url);
						}
						showNotification(true, jp.message.common.uploadSuccessful);
						setIsUploading(false);
						setIsModalSelectFileOpen(false);
					}
				}
			}
		}
	}, [actionData]);

	return (
		<Modal
			styles={{ content: { border: "none", borderRadius: 0 } }}
			title="Asset Metadata"
			cancelText={jp.common.cancel}
			okText={jp.common.upload}
			open={isModalSelectFileOpen}
			onOk={handleUpload}
			okButtonProps={{ disabled: !selectedFile, loading: isUploading }}
			cancelButtonProps={{ disabled: isUploading }}
			onCancel={() => {
				if (!isUploading) {
					setIsModalSelectFileOpen(false);
				}
			}}
			centered
		>
			<Dragger
				{...props}
				style={{ borderRadius: 0 }}
				accept={AllowTypes}
				fileList={selectedFile ? [selectedFile] : []}
				itemRender={(originNode, file) => (
					<UploadListItem originNode={originNode} />
				)}
			>
				<p className="ant-upload-drag-icon">
					<Icon icon="inbox" />
				</p>
				<p className="ant-upload-text">{jp.common.clickOrDragToUpload}</p>
				<p className="ant-upload-hint">
					Support for a single or bulk upload. Strictly prohibited from
					uploading company data or other banned files.
				</p>
			</Dragger>
		</Modal>
	);
};

export default ModalSelectFile;

const UploadListItem = ({ originNode }: UploadListItemProps) => {
	return <div className={"text-blue-500"}>{originNode}</div>;
};
