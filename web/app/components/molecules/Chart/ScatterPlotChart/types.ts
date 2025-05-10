export interface ScatterPlotProps<T extends Record<string, unknown>> {
	data: T[];
	xAxis: keyof T;
	yAxis: keyof T;
	sizeAxis?: keyof T; // Optional field to represent bubble size in case of a bubble chart
	colorAxis?: keyof T; // Optional field to determine color coding
	isDot?: boolean;
	showLegend?: boolean;
	mapping?: { value: string; key: string }[];
}
