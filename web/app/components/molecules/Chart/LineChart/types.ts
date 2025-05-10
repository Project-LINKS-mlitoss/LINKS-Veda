// biome-ignore lint/suspicious/noExplicitAny: FIXME
export interface LineChartProps<T extends Record<string, any>> {
	data: T[];
	xAxis: string;
	yAxes: string;
	isDot?: boolean;
	showLegend?: boolean;
	mapping?: { value: string; key: string }[];
}
