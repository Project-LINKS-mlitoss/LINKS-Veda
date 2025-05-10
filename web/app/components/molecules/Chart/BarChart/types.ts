export interface TickStyle {
	fill: string;
	fontSize: number;
	angle: number;
	textAnchor: "start" | "middle" | "end";
	dx?: number;
	dy?: number;
}

export interface AxisConfig {
	stroke: string;
	domain?: [number, number];
	ticks?: number[];
}

export interface MarginConfig {
	top: number;
	right: number;
	left: number;
	bottom: number;
}

export interface BarConfig {
	barSize: number;
	barGap: number;
	barCategoryGap: number;
}

export interface BarClickData {
	payload?: {
		name: string;
		value: number;
		seaAreaCode: string;
	};
}

export interface BarChartData {
	name: string;
	value: number;
	[key: string]: unknown;
}

export interface BarChartProps<T extends BarChartData> {
	data: T[];
	xValue: keyof T;
	yValues: keyof T;
	showXAxis?: boolean;
	showYAxis?: boolean;
	height?: number | string;
	width?: string;
	margins?: MarginConfig;
	barConfig?: BarConfig;
	xAxisTickStyle?: Partial<TickStyle>;
	yAxisTickStyle?: Partial<TickStyle>;
	xAxisConfig?: Partial<AxisConfig>;
	yAxisConfig?: Partial<AxisConfig>;
	activeArea?: string | null;
	onBarClick?: (data: BarClickData) => void;
	mapping?: { value: string; key: string }[];
}
