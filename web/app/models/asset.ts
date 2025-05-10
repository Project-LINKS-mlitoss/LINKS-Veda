import type { UploadFileStatus } from "antd/es/upload/interface";

export interface FileChild {
	children: FileChild[];
	contentType: string;
	name: string;
	path: string;
	size: number;
}

export interface FileAsset {
	children: FileChild[] | [];
	contentType: string;
	name: string;
	path: string;
	size: number;
}

export interface AssetItem {
	archiveExtractionStatus: string;
	contentType: string;
	createdAt: string;
	createdBy?: string;
	file: FileAsset;
	id: string;
	name: string;
	previewType: string;
	projectId: string;
	totalSize?: number;
	updatedAt: string;
	url: string;
}

export interface AssetsResponse {
	items: AssetItem[];
	page: number;
	perPage: number;
	totalCount: number;
}

export class Asset {
	id: string;
	name: string;
	archiveExtractionStatus: string;
	contentType: string;
	createdAt: string;
	file: FileAsset;
	previewType: string;
	projectId: string;
	totalSize?: number;
	updatedAt: string;
	url: string;

	constructor(props: AssetItem) {
		this.id = props.id;
		this.name = props.name;
		this.archiveExtractionStatus = props.archiveExtractionStatus;
		this.contentType = props.contentType;
		this.createdAt = props.createdAt;
		this.file = props.file;
		this.previewType = props.previewType;
		this.projectId = props.projectId;
		this.totalSize = props.totalSize;
		this.updatedAt = props.updatedAt;
		this.url = props.url;
	}
}

export interface AssetParams {
	page: number;
	perPage: number;
	sort: string;
	dir: string;
	keyword: string;
}

import type { GetProp, UploadProps } from "app/components/atoms/Upload";
import { match } from "ts-pattern";

export type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

export interface UploadQueueItem {
	uid?: string;
	signedUrl?: string | undefined;
	contentType?: string;
	contentEncoding?: string;
	file: File | Blob;
	name: string;
	size: number;
	status?: number | undefined;
	token?: string | undefined;
	uploadProgress?: number | undefined;
}

export interface GetSignedUrlRequest {
	id: number;
	name: string;
}

export interface GetSignedUrlItemResponse {
	id: number;
	url: string;
}

export interface GetSignedUrlsResponse {
	items: GetSignedUrlItemResponse[];
}

//deprecated
export interface PrepareUploadRequest {
	name: string;
	contentLength: number;
	cursor: string;
}

export interface GcsModel {
	url: string;
	token: string;
	contentType: string;
	contentEncoding: string;
	contentLength: number;
	next: string;
}

export interface CreateAssetRequest {
	url: string;
	token: string;
	skipDecompression: boolean;
}

export const toCreateAssetRequest = (
	url: string,
	token: string,
	skip: boolean,
): CreateAssetRequest => {
	return {
		url: url,
		token: token,
		skipDecompression: skip,
	};
};

export interface GenerateSigndUrlResponse {
	items: UploadQueueItem[];
	success: boolean;
}

export interface UploadResponse {
	data: UploadQueueItem[] | undefined;
	intent: string | undefined;
	success: boolean;
}

export type UploadToGCSResponse = {
	success: boolean;
};

export interface CreateAssetResponse {
	success: boolean;
	error: string | undefined;
	asset?: Asset;
}

export const getUploadStatus = (type: number): string => {
	return match(type)
		.with(UploadStatus.Failure, () => "Failure")
		.with(UploadStatus.Waiting, () => "Waiting")
		.with(UploadStatus.Uploading, () => "Uploading")
		.with(UploadStatus.Success, () => "Success")
		.with(UploadStatus.AssetCreated, () => "AssetCreated")
		.otherwise(() => "Failure");
};

export type UploadStatus = -1 | 0 | 1 | 2 | 3 | 4;

export const UploadStatus = {
	Failure: -1,
	Waiting: 0,
	Uploading: 1,
	Success: 2,
	AssetCreated: 3,
};

export const UploadIntent = {
	requestSignedUrls: "requestSignedUrls",
	createAsset: "createAsset",
};

export const getFileUploadStatus = (
	type: number | undefined,
): UploadFileStatus => {
	return match(type)
		.with(UploadStatus.Failure, () => "error" as const)
		.with(UploadStatus.Waiting, () => "removed" as const)
		.with(UploadStatus.Uploading, () => "uploading" as const)
		.with(UploadStatus.Success, () => "done" as const)
		.with(UploadStatus.AssetCreated, () => "done" as const)
		.otherwise(() => "removed" as const);
};

export const UploadingFormStatus = {
	None: 0,
	Uploading: 1,
	Complete: 2,
};

export interface Point {
	position: [number, number];
	name: string;
}

export interface Dataset {
	name: string;
	points: Point[];
}

export interface Datasets {
	[key: string]: Dataset;
}
