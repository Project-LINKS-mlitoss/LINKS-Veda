/**
 * Each radar data point. For example:
 * {
 *   category: "労働生産性",
 *   value: 60,
 *   [any others...]
 * }
 */
export interface RadarChartData {
	category: string;
	value: number;
	[key: string]: unknown;
}

export interface RadarChartProps<T extends RadarChartData> {
	data: T[];
	width?: string | number;
	height?: number;
	margin?: {
		top?: number;
		right?: number;
		bottom?: number;
		left?: number;
	};
	radarConfig?: {
		stroke: string;
		fill: string;
		fillOpacity: number;
	};
	/** Show Recharts Tooltip */
	showTooltip?: boolean;
}
