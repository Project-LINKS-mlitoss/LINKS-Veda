import type { GeoJSONFeature } from "~/components/pages/Visualizations/types";

// biome-ignore lint/suspicious/noExplicitAny: FIXME
export interface ChartConfig<T extends Record<string, any>> {
	data: T[];
	chart: {
		type: "line" | "bar" | "pie";
		xAxis: keyof T;
		yAxis: keyof T;
		details?: string | undefined;
		city?: string[] | undefined;
		mapping?: { key: string; value: string }[];
	};
	showAverage?: boolean;
	unit?: string;
	mapping?: { key: string; value: string }[];
	uc16PieChart?: boolean;
	flightData?: GeoJSONFeature[];
}
