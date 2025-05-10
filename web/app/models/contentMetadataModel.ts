import type { JsonValue } from "@prisma/client/runtime/library";

export interface ContentMetadataI {
	id?: number;
	contentId?: string;
	username?: string;
	userId?: string;
	metadataJson?: JsonValue;
	createdAt?: Date | null | string;
	updatedAt?: Date | null | string;
	deletedAt?: Date | null | string;
}

export interface ContentMetaData {
	title?: string;
	description?: string;
	byteSize?: number;
	format?: string;
	compressFormat?: string;
	mediaType?: string;
	issued?: string;
	modified?: string;
	temporalResolution?: string;
	accessRights?: string;
	language?: string;
	license?: string;
	rights?: string;
	conformsTo?: string;
	isReferencedBy?: string;
	accessURL?: string;
	downloadURL?: string;
	source?: string;
	documentName?: string;
}

export enum ContentMetaDataLabel {
	title = "タイトル（ファイル名）",
	description = "説明",
	byteSize = "バイトサイズ",
	format = "ファイル形式",
	compressFormat = "圧縮形式",
	mediaType = "メディアタイプ",
	issued = "公開日",
	modified = "最終更新日",
	temporalResolution = "期間",
	accessRights = "ステータス",
	language = "言語",
	license = "ライセンス",
	rights = "利用規約",
	conformsTo = "準拠する標準",
	isReferencedBy = "関連ドキュメント",
	accessURL = "アクセスURL",
	downloadURL = "ダウンロードURL",
	source = "出典",
	documentName = "資料名",
}
