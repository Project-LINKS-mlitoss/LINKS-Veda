import type {
	Feature,
	FeatureCollection,
	GeoJsonProperties,
	Geometry,
} from "geojson";

import type {
	AggregatedDataRow,
	BusinessPerformanceReportRow,
} from "./uc12DataTypes";

export interface GeneralPermitData {
	"氏名（企業名）": string;
	起点_港名: string;
	終点_港名: string;
	ファイル名: string;
	"発航中止基準　渡航中　風速（m/s以上）_1": string;
	"発航中止基準　渡航中　波高（m以上）_1": string;
	"発航中止基準　渡航中　霧による視程障害を考慮した「水平方向の見通し距離」_1": string;
	[key: string]: string | number | boolean | null;
}

// export interface UC12Data {
//   aggregatedData: AggregatedDataRow[] | null;
//   businessPerformanceReportData1: GeoJSON.FeatureCollection | null;
//   businessPerformanceReportData2: GeoJSON.FeatureCollection | null;
//   businessPerformanceReportData3: GeoJSON.FeatureCollection | null;
//   businessPerformanceReportData4: GeoJSON.FeatureCollection | null;
//   businessPerformanceReportData5: GeoJSON.FeatureCollection | null;
//   regionalTransportBureauPolygon: GeoJSON.GeoJsonObject | null;
//   businessPerformanceReportDataAggregated: GeoJSON.FeatureCollection | null;
// }

export interface UC12Data {
	businessPerformanceReportData1: unknown | null;
	businessPerformanceReportData2: unknown | null;
	businessPerformanceReportData3: unknown | null;
	businessPerformanceReportData4: unknown | null;
	businessPerformanceReportData5: unknown | null;
	regionalTransportBureauPolygon: unknown | null;
	businessPerformanceReportDataAggregated: unknown | null;
}

export interface UC14Data {
	shipAccidentReport: GeoJSON.GeoJsonObject | null;
	aisRouteDataPoint: GeoJSON.GeoJsonObject | null;
	aisRouteDataPolyline: GeoJSON.GeoJsonObject | null;
	marineForecastAreas: GeoJSON.GeoJsonObject | null;
	marineForecastMesh: GeoJSON.GeoJsonObject | null;
	aisTrafficVolume: GeoJSON.GeoJsonObject | null;
	generalData: GeneralPermitData[] | null;
}
export interface UC16Data {
	uavFlightPlans: GeoJSON.FeatureCollection | null;
	surroundingAreas: GeoJSON.FeatureCollection | null;
	yellowZones: GeoJSON.FeatureCollection | null;
	redZones: GeoJSON.FeatureCollection | null;
	inhabitedDistrict: GeoJSON.FeatureCollection | null;
	takeoffLandingAreas: GeoJSON.FeatureCollection | null;
	administrativeBoundaries: GeoJSON.FeatureCollection | null;
}

export interface OptimizedGeoDataResult {
	geoJsonData: GeoJSON.GeoJsonObject | null;
	geometries: FeatureCollection | null;
	isLoading: boolean;
	uc16Data: {
		geometries: FeatureCollection | null;
		geoJsonData: GeoJSON.GeoJsonObject | null;
	};
	uc14Data: UC14Data;
}
// the optional secondary Array Item for linking between datasets extracted from Google Cloud Storage and to be DELETED when filtering API from backend is done.
export type SecondaryArrayItem = {
	[key: string]: string | number | undefined | null; // If dynamic keys exist
};
