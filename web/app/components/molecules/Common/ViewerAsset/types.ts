export enum LAYOUT_PREVIEW_TYPE {
	FILE = 1,
	GIS_AND_CONTENT = 2,
	FOLDER_AND_FILE = 3,
}

export interface DataTypeFolderViewer {
	key: React.Key;
	id: string;
	name: string;
	size: string;
	path: string;
}
