import type { FeatureCollection } from "geojson";
import type { AssetItem } from "~/models/asset";

export interface DataTableAssetsType extends AssetItem {
	key: React.Key;
	id: string;
	fileName: string;
	uploadStatus: string;
	type: string;
	size: string;
	uploader: string;
	uploadTime: string;
}

export interface FeatureCollectionWithFilename extends FeatureCollection {
	fileName?: string;
}

export type ViewerType =
	| "geo"
	| "geo_3d_tiles"
	| "geo_mvt"
	| "image"
	| "image_svg"
	| "model_3d"
	| "csv"
	| "unknown";

export enum FileType {
	PNG = "png",
	PDF = "pdf",
	XLSX = "xlsx",
	XLS = "xls",
	CSV = "csv",
	DOCX = "docx",
	DOC = "doc",
	JSON = "json",
	GEOJSON = "geojson",
	SHP = "shp",
	GEOPACKAGE = "geopackage",
	ZIP = "zip",
	SEVEN_ZIP = "7z",
}

export interface UploadListItemProps {
	originNode: React.ReactElement;
}
