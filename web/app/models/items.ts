export interface ItemField {
	id?: string;
	type?: string;
	value: string;
	key: string;
	group?: string;
}

export interface ItemMetadataField {
	id?: string;
	type?: string;
	value: string;
	key: string;
	group?: string;
}

export type Confident = Record<string, number>;

export interface Item {
	id: string;
	modelId: string;
	fields: ItemField[];
	createdAt: string;
	updatedAt: string;
	version: string;
	parents: string[];
	refs: string[];
	referencedItems: string[];
	metadataFields: ItemMetadataField[];
	isMetadata: boolean;
	confident?: Confident | null;
}

export interface ItemsResponse {
	items: Item[];
	totalCount: number;
	page: number;
	perPage: number;
}

export interface ItemsRequest {
	fields?: ItemField[];
	metadataFields?: ItemMetadataField[];
}

export interface ContentItemParams {
	page?: number;
	perPage?: number;
}

export class ItemModel {
	id: string;
	modelId: string;
	fields: ItemField[];
	createdAt: string;
	updatedAt: string;
	version: string;
	parents: string[];
	refs: string[];
	referencedItems: string[];
	metadataFields: ItemMetadataField[];
	isMetadata: boolean;
	confident?: Confident | null;

	constructor(props: Item) {
		this.id = props.id;
		this.modelId = props.modelId;
		this.fields = props.fields;
		this.createdAt = props.createdAt;
		this.updatedAt = props.updatedAt;
		this.version = props.version;
		this.parents = props.parents;
		this.refs = props.refs;
		this.referencedItems = props.referencedItems;
		this.metadataFields = props.metadataFields;
		this.isMetadata = props.isMetadata;
		this.confident = props.confident;
	}
}

export interface ItemParams {
	modelId: string;
	sort?: string;
	dir?: string;
	page?: number;
	perPage?: number;
	ref?: string;
	asset?: string;
	query?: string;
	confident?: boolean;
	useCase?: string;
	ufn?: string;
	startTime?: string;
	finishTime?: string;
	seaArea?: string | number | null;
	windSpeed?: string | number | null;
	waveHeight?: string | number | null;
	visibility?: string | number | null;
	windSpeedOP?: string | number | null;
	waveHeightOP?: string | number | null;
	visibilityOP?: string | number | null;
	shipTonnage?: string | number | null;
	shipQuality?: string | number | null;
	shipUsage?: string | number | null;
	shipCapacity?: string | number | null;
}
