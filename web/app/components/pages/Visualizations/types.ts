import type {
	Feature,
	FeatureCollection,
	GeoJsonProperties,
	Geometry,
	Point,
	Polygon,
} from "geojson";
import type { ZoneConfig } from "~/commons/area.const";

export type ChartType = "pie" | "bar" | "line";

export interface ChartInstance {
	id: string;
	title: string;
	type: ChartType;
	selectedCities: string[];
	selectedIncidents: string[];
	isSelected: boolean;
	createdAt: number;
}
export interface ChartFormData {
	title: string;
	type: ChartType;
	selectedCities: string[];
	selectedIncidents: string[];
}

export const MAP_LAYERS = {
	standard: {
		url: "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
		name: "国土地理院標準地図",
		isDark: false,
	},
	pale: {
		url: "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",
		name: "国土地理院淡色地図",
		isDark: false,
	},
	reference: {
		url: "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
		name: "CartoDB Dark",
		isDark: true,
	},
} as const;
export const MAP_LAYER_KEYS = ["standard", "pale", "reference"] as const;
export type MapLayerKey = keyof typeof MAP_LAYERS;

export type LayerType = "point" | "line" | "polygon" | "geojson";

export interface GeoJSONFeature {
	type: "Feature";
	geometry: Geometry;
	properties: GeoJsonProperties;
}

export interface GeoJSONLayer {
	id: string;
	data?: FeatureCollection;
	type:
		| "point"
		| "polygon"
		| "line"
		| "fill"
		| ((
				feature: Feature<Geometry, GeoJsonProperties>,
		  ) => "point" | "polygon" | "line");
	style: {
		color: string;
		fillOpacity?: number;
		weight?: number;
		opacity?: number;
	};
	cursor?: string;
	markerIcon?: string;
	labelField?: string;
	source?: {
		type: "geojson" | "vector";
		data?: FeatureCollection;
		tiles?: string[];
		cluster?: boolean;
		clusterMaxZoom?: number;
		clusterRadius?: number;
		minzoom?: number;
		maxzoom?: number;
	};
	sourceLayer?: string;
	onClick?: (feature: Feature<Geometry, GeoJsonProperties>) => void;
	sourceType?: "vector";
	tiles?: string[];
	minzoom?: number;
	maxzoom?: number;
	promoteId?: string;
	filter?: unknown;
}

export type MapLayer = GeoJSONLayer;

export interface AccidentFeature {
	type: "Feature";
	geometry: {
		type: "Point";
		coordinates: [number, number];
	};
	properties: {
		番号: string;
		発生日時: string;
		発生場所: string;
		運航者: string;
		型式: string;
		製造者名_2: string;
		出発地: string;
		目的地: string;
		報告の概要: string;
		人の死傷状況: string;
		name: string;
		[key: string]: string;
	};
}

export interface LayerStyle {
	color: string;
	fillOpacity?: number;
	weight?: number;
	opacity?: number;
}

export interface MapProps<T> {
	selectedLayer: MapLayerKey;
	onLayerChange: (layer: MapLayerKey) => void;
	activeZoneConfig?: ZoneConfig | null;
	setActiveZoneConfig: (config: ZoneConfig | null) => void;
	activeZoneConfigArray?: string[] | null;
	setActiveZoneConfigArray?: React.Dispatch<React.SetStateAction<string[]>>;
	onAccidentSelect?: (accident: T | undefined) => void;
	markers?: FeatureCollection<Point>;
	polygonData?: FeatureCollection<Geometry>;
	geoJsonData?: GeoJSON.GeoJsonObject | null;
	onMapInit?: (map: maplibregl.Map) => void;
	setCanvas?: (canvas: HTMLCanvasElement | undefined) => void;
	keyField?: string;
	layers?: GeoJSONLayer[];
	setActiveZonesDefault?: React.Dispatch<React.SetStateAction<string[]>>;
	setMapInstance?: (map: maplibregl.Map | null) => void;
}

interface CorrelationData {
	area: number;
	statistics: {
		windSpeed: { average: number; correlation: number };
		waveHeight: { average: number; correlation: number };
		visibility: { average: number; correlation: number };
		accidentCount: number;
	};
}

export interface MergedRouteData {
	船名_1: string | undefined;
	"氏名（企業名）"?: string | undefined;
	起点_港名?: string | undefined;
	終点_港名?: string | undefined;
	相互間の距離?: string | undefined;
	事業者所在地?: string | undefined;
	船舶の種類_1?: string | undefined;
	船質_1?: string | undefined;
	航行区域_1?: string | undefined;
	船舶保有者_1?: string | undefined;
	用途_1?: string | undefined;
	総トン数_1?: string | undefined;
	"定員(旅客)_1"?: string | number | undefined;
	"定員(船員)_1"?: string | number | undefined;
	"定員(その他の乗船者)_1"?: string | number | undefined;
	主機の種類_1?: string | undefined;
	連続最大出力_1?: string | undefined;
	最高速力_1?: string | undefined;
	航海速力_1?: string | undefined;
	全長_1?: string | undefined;
	幅_1?: string | undefined;
	最大高_1?: string | undefined;
	"最大（満載）喫水_1"?: string | undefined;
	造船所_1?: string | undefined;
	無線設備_1?: string | undefined;
	"運動性能(旋回径)_1"?: string | undefined;
	"運動性能(惰力)_1"?: string | undefined;
	操船上の特殊設備_1: string | undefined;
	バリフリ対応状況_1: string | undefined;
}

export interface SeaAccidentFeature {
	meshIds: string[];
	type: "Feature";
	geometry: {
		type: string;
		coordinates: number[] | number[][] | number[][][];
	};
	properties: {
		[key: string]: unknown;
		correlationData?: CorrelationData;
		isSelected?: boolean;
		csvData?: {
			vesselName?: string;
			vesselType?: string;
			tonnage?: string; // Update type if it's a number in your data
			accidentType?: string;
			weatherCondition?: string;
			casualties?: number;
			damageLevel?: string;
			tableData?: {
				date: string;
				location: string;
				type: string;
				details: string;
			}[];
		};
		メッシュIDリスト: string;
		"﻿発生日時"?: string;
		"報告書番号（事故等番号）": string;
		その他の事項: string;
		ファイル名: string;
		乗組員等に関する情報: string;
		事故の概要: string;
		"事故発生日　予報風向": string;
		"事故発生日　予報風速": string;
		事故種類: string;
		事故調査の経過: string;
		再発防止策: string;
		分析: string;
		原因: string;
		報告書日時: string;
		報告書番号: string;
		損傷: string;
		"機関_出力　進水等": string;
		死傷者等: string;
		気象海象: string;
		波の高さ: string;
		発生場所: string;
		発生日時: string;
		総トン数: string;
		船名: string;
		船種: string;
		船舶所有者等: string;
		船舶番号: string;
		"霧による視程障害を考慮した「水平方向の見通し距離」": string;
		項目: string;
		"Ｌ×Ｂ×Ｄ、船質": string;
		_document_name: string;
		// FIXME
		// @ts-ignore
		routeOptionsData: MergedRouteData[];
	};
}
export interface IAisRouteDataPolyline {
	key: string;
	properties: {
		MMSI番号: string;
		船名: string;
		航路ジオメトリ: string;
		事業者名: string;
	};
}
export interface ITrafficMesh {
	properties: {
		mesh_id: string;
		時間: string;
		交通量: string;
		混雑度: string;
	};
}
export interface ISeaArea {
	properties: {
		mesh_id: string;
		date: string;
		name: string;
		風速: string;
		波高: string;
		視程: string;
	};
	geometry: Geometry;
}
export interface ITableFilter {
	keyword: string;
	page: number;
	perPage: number;
}

export interface PreviewField {
	key: string;
	value: string | number;
}

export interface PreviewItem {
	month: string;
	fields: PreviewField[];
}

export interface PreviewRow {
	[key: string]: string | number;
}

export type Measurement = string;

export type DataSets = {
	uavFlightPlans: FeatureCollection | null;
	surroundingAreas: FeatureCollection | null;
	yellowZones: FeatureCollection | null;
	redZones: FeatureCollection | null;
	takeoffLandingAreas: FeatureCollection | null;
	administrativeBoundaries: FeatureCollection | null;
	inhabitedDistrict: FeatureCollection | null;
};

export interface MVTLayerConfig {
	id: string; // Unique ID for the layer
	serverUrl: string; // URL of the MVT tile server
	sourceLayer: string; // Name of the source layer in the MVT tile
	key: string; // Property key to filter the features
	minzoom?: number;
	maxzoom?: number;
	style: {
		type: "fill" | "line" | "symbol";
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		paint?: Record<string, any>; // Style properties for paint (e.g., color, size)
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		layout?: Record<string, any>; // Optional layout properties
	};
	additionalStyle?: {
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		clickedColor?: any;
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		selectedColor?: any;
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		color?: any;
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		outlineColor?: any;
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		clickedOutlineColor?: any;
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		selectedOutlineColor?: any;
		opacity?: number;
		clickedOpacity?: number;
		selectedOpacity?: number;
		lineWidth?: number;
		clickedlineWidth?: number;
	};
}

export interface MVTLayerProp {
	id: string; // Unique ID for the layer
	filterValues: (string | number)[]; // Set of allowed values for filtering
	isFiltering: boolean;
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	onClick?: (item: any) => void;
	onUnClick?: () => void;
	title?: string;
}

export interface LayerConfig {
	id: string;
	data?: {
		type: string;
		features: Feature[];
	};
	source?: {
		type: "vector" | "geojson";
		tiles?: string[];
		minzoom?: number;
		maxzoom?: number;
	};
	type: "line" | "polygon" | "point";
	sourceType?: "vector";
	tiles?: string[];
	isVectorTile?: boolean;
	sourceLayer?: string;
	style: {
		color: string;
		opacity: number;
		weight: number;
		fillOpacity?: number;
	};
	cursor?: string;
	filter?: unknown;
	promoteId?: string;
	onClick?: (feature: Feature, e?: unknown) => void;
	markerType?: string;
	markerIcon?: string;
}
export type UAVFlightPlanFeature = {
	type: "Feature";
	properties: {
		[key: string]: string | number | null;
	};
	geometry: {
		type: "Point";
		coordinates: [number, number];
	};
};
