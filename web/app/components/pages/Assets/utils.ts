import type { AssetItem } from "~/models/asset";
import type { DataTableAssetsType } from "./types";

export function checkPreviewType(assetItem: DataTableAssetsType | AssetItem) {
	const previewType = assetItem.previewType;
	const urlSplit = assetItem?.url.split(".");
	const typeFile = urlSplit[urlSplit.length - 1];

	switch (true) {
		case ["pdf", "png", "docx", "xlsx", "xls", "csv"].includes(typeFile):
			return 1;
		case ["shp", "geojson", "gpkg"].includes(typeFile):
			return 2;
		default:
			return 3;
	}
}

export const AllowTypes =
	".pdf, .png, .zip, .7z, .docx, .xlsx, .xls, .csv, .shp, .geojson, .gpkg";
