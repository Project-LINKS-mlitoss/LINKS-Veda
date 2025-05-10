import type { Feature, GeoJsonProperties, Geometry } from "geojson";
import type { ChartType } from "~/components/molecules/Chart/types";
import type { initRegressionDataFields } from "~/components/pages/Visualizations/UC16/UFN002";
import type { Item } from "~/models/items";
interface SearchParams {
	date: string;
	area: string;
	equipmentType: string | string[];
	type: string | string[];
	weight: string;
	purpose: string | string[];
}

export interface ChartViewerProps<T = ChartsFormType> {
	charts: T[];
	data: Item[];
	onChartSelect: (chartId: string) => void;
	onChartDelete: (chartId: string) => void;
	flightData?: Feature<Geometry, GeoJsonProperties>[] | undefined;
	uavAccidentDataForGraph?: Feature<Geometry, GeoJsonProperties>[] | undefined;
	flightRoutePlans?: GeoJsonProperties[] | undefined;
	flightPlansForGraph?: GeoJsonProperties[] | undefined;
	searchParams?: SearchParams;
	regressionData?: typeof initRegressionDataFields;
	uc16PieChart?: boolean;
	readonly?: boolean;
	setRegressionFieldsData?: React.Dispatch<
		React.SetStateAction<typeof initRegressionDataFields>
	>;
}
export interface ChartsFormType {
	id: string;
	title: string;
	type: ChartType;
	xAxis: keyof Item;
	yAxis: keyof Item;
	details: string;
	isSelected: boolean;
	createdAt: number;
	mapping?: { value: string; key: string }[];
	prefecture?: string[];
	city?: string[];
	data?: Item[];
	stackKeys?: string[];
	graphFor?: "事故分析" | "飛行計画分析";
	attribute: string;
	timeSeriesUnit?: "year" | "quarter" | "month" | "hour";
}
