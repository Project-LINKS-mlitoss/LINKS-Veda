import type { AxisConfig, TickStyle } from "./types";

export const DEFAULT_MARGINS = {
	top: 0,
	right: 10,
	left: 10,
	bottom: 50,
};

export const DEFAULT_BAR_CONFIG = {
	barSize: 15,
	barGap: 0,
	barCategoryGap: 30,
};

export const DEFAULT_X_AXIS_TICK_STYLE: TickStyle = {
	fill: "#6B7280",
	fontSize: 12,
	angle: -45,
	textAnchor: "end",
	dx: 0,
	dy: 5,
};

export const DEFAULT_Y_AXIS_TICK_STYLE: TickStyle = {
	fill: "#6B7280",
	fontSize: 12,
	angle: 0,
	textAnchor: "end",
};

export const DEFAULT_AXIS_CONFIG: AxisConfig = {
	stroke: "#E5E7EB",
	domain: [0, 100],
	ticks: [0, 25, 50, 75, 100],
};
