import type { Dayjs } from "dayjs";
import type { Feature, GeoJsonProperties, Point } from "geojson";
import type { GeneralCsvData } from "~/components/pages/Visualizations/UC14/UFN001v2/components/Map/types";
import type {
	FilterSubmitValues,
	selectedTableRow,
} from "~/components/pages/Visualizations/UC14/UFN001v2/types";
import type {
	SeaAccidentFeature,
	UAVFlightPlanFeature,
} from "../../../../pages/Visualizations/types";

interface FieldObject {
	id: string;
	fields: {
		id: string;
		key: string;
		type: string;
		value: string | number | null;
	}[];
}
export type FlightPlan = {
	[key: string]: string | number;
};

export interface PanelProps {
	currentItem: SeaAccidentFeature;
	onShowGraphPanel: () => void;
	values?: FilterSubmitValues;
	handleBack: () => void;
	isTableHide?: boolean;
	features: UAVFlightPlanFeature[];
	flightPlans: FlightPlan[];
}

export interface MeshItem {
	properties: {
		departure?: string;
		arrival?: string;
		operator?: string;
		MMSI番号?: string;
		shipName?: string;
		date?: Dayjs;
		風速: number;
		波高: number;
		視程: number;
		mesh_id: string;
		name: string;
	};
}

export interface AverageValues {
	averageWindSpeed: number;
	averageWaveHeight: number;
	averageVisibility: number;
}

export interface ExtendedSeaAccidentFeature
	extends SeaAccidentFeature,
		RouteItem {}
export interface MeshDetailProps {
	currentItem?: ExtendedSeaAccidentFeature;
	values?: FilterSubmitValues;
	fieldObjects: {
		id: string;
		fields: {
			id: string;
			key: string;
			type: string;
			value: string | number | null;
		}[];
	}[];
	selectedMesh?: MeshItem;
	accidents?: Feature<Point, GeoJsonProperties>[];
	handleTextExpand?: (value: string) => void;
	filteredMeshes?: MeshItem[];
}

export type TrafficVolumeData = {
	properties?: {
		日時?: string;
		交通量?: number;
		メッシュID?: number;
	};
};

export interface AccidentProps {
	properties: {
		メッシュID: string;
	};
}

export interface RouteItem {
	departure?: string;
	arrival?: string;
	operator?: string;
	MMSI番号?: string;
	shipName?: string;
	hasRoute?: boolean;
}

type dataType = Array<{
	[x: string]: string;
}>;

export interface RouteDetailProps {
	currentItem?: ExtendedSeaAccidentFeature;
	values?: FilterSubmitValues;
	fieldObjects: {
		id: string;
		fields: {
			id: string;
			key: string;
			type: string;
			value: string | number | null;
		}[];
	}[];
	filteredMeshes: MeshItem[];
	handleTextExpand?: (value: string) => void;
	selectedTableRow?: selectedTableRow;
	generalCsvData?: GeneralCsvData;
}

export interface ShipItem {
	properties: {
		船名: string;
	};
}

export type MeshProperties = {
	departure?: string;
	arrival?: string;
	operator?: string;
	MMSI番号?: string;
	shipName?: string;
	date?: Dayjs;
	風速?: number;
	波高?: number;
	視程?: number;
	name: string;
};

type GraphContentType = "windSpeedAve" | "waveHeightAve" | "visibilityAve";

export interface SeaAreaChartsProps {
	formDataState: FilterSubmitValues;
	lineChartData: {
		name: string;
		windSpeed: number;
		waveHeight: number;
		visibility: number;
	}[];
	graphContent: GraphContentType;
	setGraphContent: (value: GraphContentType) => void;
}

export type UAVPolygon = {
	type: "Polygon";
	coordinates: number[][][];
};
