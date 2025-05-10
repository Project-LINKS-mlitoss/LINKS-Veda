import type React from "react";
import {
	Cell,
	Pie,
	PieChart as PieChartBase,
	ResponsiveContainer,
	Tooltip,
} from "~/components/atoms/Chart";
import type { PieChartData, PieChartProps } from "./types";

const CustomTooltip: React.FC<{
	active?: boolean;
	payload?: {
		name: string;
		value: number | string;
		payload: {
			name: string;
			value: number | string;
			color: string;
			fill: string; // This is the color passed from Cell
		};
	}[];
}> = ({ active, payload }) => {
	if (active && payload && payload.length) {
		const { name, value, payload: nestedPayload } = payload[0];
		const fillColor = nestedPayload.fill || nestedPayload.color; // Use `fill` or `color
		return (
			<div
				style={{
					backgroundColor: "white",
					border: "1px solid #ccc",
					padding: "10px",
					borderRadius: "5px",
					boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
					<div
						style={{
							width: "12px",
							height: "12px",
							backgroundColor: fillColor,
							borderRadius: "50%",
						}}
					/>
					<span style={{ fontWeight: "bold" }}>{name}</span>
				</div>
				<div>Value: {value}</div>
			</div>
		);
	}

	return null;
};

const PieChart: React.FC<PieChartProps<PieChartData>> = ({
	data,
	selectedKey,
	width = 300,
	height = 500,
	innerRadius = 80,
	outerRadius = 100,
}) => {
	return (
		//@ts-ignore
		<ResponsiveContainer className="relative" width="100%" height={height}>
			<PieChartBase width={width} height={height} data-chart-id={selectedKey}>
				<Tooltip content={<CustomTooltip />} />
				<Pie
					data={data}
					cx="60%"
					cy="40%"
					innerRadius={innerRadius}
					outerRadius={outerRadius}
					paddingAngle={5}
					dataKey="value"
					label={({ name, value }) => `${name}: ${value}`}
					fontSize={12}
				>
					{data.map((entry) => (
						<Cell key={`item_${entry.color}`} fill={entry.color} />
					))}
				</Pie>
			</PieChartBase>
		</ResponsiveContainer>
	);
};

export default PieChart;
