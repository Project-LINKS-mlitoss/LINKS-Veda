import type { ContentChatI } from "~/models/contentChatModel";
export interface DataTableChatType extends ContentChatI {
	key: number;
	id: number;
	fileName: string;
	createdBy: string;
	createdAt: string;
}

export enum CELL_MODE {
	NO_DATA = "NO_DATA",
	NEW = "NEW",
	EDITED = "EDITED",
	DELETED = "DELETED",
	DEFAULT = "DEFAULT",
}
