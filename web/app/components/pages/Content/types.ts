import type React from "react";
import type { ContentItem } from "~/models/content";
import type { ContentField } from "~/models/content";
import type { ItemModel } from "~/models/items";
export interface DataTableContentType extends ContentItem {
	key: string;
	id: string;
	fileName?: string;
	createdBy?: string;
	createdAt: string;
	updatedBy?: string;
	updatedAt: string;
	updatedAtTime?: string;
}

export enum FIELD_TYPE {
	Text = "text",
	Multiple = "multiple",
	Bool = "bool",
	TextArea = "textArea",
	DateTime = "datetime",
	GeometryObject = "geometryObject",
	Integer = "integer",
	Number = "number",
	Select = "select",
	Date = "date",
}

export type AddContentInput = {
	initialValue: string;
	contentName: string;
	type: string;
};

export type FieldPossibleValue = string | string[] | boolean | number | null;

export type RenderContentField = ContentField & {
	prevMode: CELL_MODE;
	mode: CELL_MODE;
	originalKey: string;
};

export type ContentItemForCreate = Omit<
	ItemModel,
	| "updatedAt"
	| "parents"
	| "refs"
	| "version"
	| "referencedItems"
	| "metadataFields"
	| "fields"
> & {
	fieldsKey: Record<string, TableItemField>;
	fields: TableItemField[];
	prevMode: CELL_MODE;
	mode: CELL_MODE;
};

export type OnItemChangeParams = {
	itemId: string;
	field: RenderContentField;
	value: string | boolean | number;
};

export type OnItemChange = (params: OnItemChangeParams) => void;

export type OnFieldChange = (field: RenderContentField) => void;

export type onDeleteRow = (tableItem: TableItem) => void;

export type TableItemField = {
	id?: string;
	type?: string;
	value: FieldPossibleValue;
	key: string;
	group?: string;
	originalValue?: FieldPossibleValue;
	prevMode: CELL_MODE;
	mode: CELL_MODE;
};

export type TableItem =
	| ContentItemForCreate
	| (Omit<ItemModel, "fields"> & {
			fieldsKey: Record<string, TableItemField>;
			fields: TableItemField[];
			prevMode: CELL_MODE;
			mode: CELL_MODE;
	  });

export type RenderCellComponent = React.FC<{
	itemId: string;
	field: RenderContentField;
	fieldValue: TableItemField;
	onItemChange: OnItemChange;
	children?: React.ReactNode;
}>;

export enum CELL_MODE {
	NO_DATA = "NO_DATA",
	NEW = "NEW",
	EDITED = "EDITED",
	DELETED = "DELETED",
	DEFAULT = "DEFAULT",
}
