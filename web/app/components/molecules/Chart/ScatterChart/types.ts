/** Each data point in the scatter.
 *  e.g., { x: 50, y: 120, z: 30, name: "A" }
 */
export interface ScatterChartData {
	x: number;
	y: number;
	z?: number;
	name?: string;
	[key: string]: unknown;
}

/**
 * The payload for onClick events
 * Recharts passes an event object with e.g., payload.activePayload[0].payload
 */
export interface ScatterClickPayload<T extends ScatterChartData> {
	payload: T;
}

/** Props for the ScatterChart component */
export interface ScatterChartProps<T extends ScatterChartData> {
	data: T[];
	width?: string | number;
	height?: number;
	margins?: {
		top?: number;
		right?: number;
		bottom?: number;
		left?: number;
	};
	scatterConfig?: {
		fill: string;
		shape: string | React.ReactNode;
	};
	/** The property name in T used for X axis. Default "x" */
	xKey?: keyof T;
	/** The property name in T used for Y axis. Default "y" */
	yKey?: keyof T;
	zKey?: keyof T;
	onScatterClick?: (payload: ScatterClickPayload<T>) => void;
	showTooltip?: boolean;
}
