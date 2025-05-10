export interface PieChartData {
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	[key: string]: any;
}

export interface PieChartProps<T extends PieChartData> {
	data: T[];
	selectedKey: keyof T;
	width?: number;
	height?: number;
	innerRadius?: number;
	outerRadius?: number;
}
