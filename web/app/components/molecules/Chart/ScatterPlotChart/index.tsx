import {
	CartesianGrid,
	ComposedChart,
	Label,
	Legend,
	Line,
	ResponsiveContainer,
	Scatter,
	Tooltip,
	XAxis,
	YAxis,
} from "app/components/atoms/Chart";
import type React from "react";
import * as regression from "regression";
import type { ScatterPlotProps } from "./types";

const calculateRegression = (data: [], xKey: string, yKey: string) => {
	if (data.length < 2) return []; // At least 2 data points

	// Convert data to 2d array
	const points = data.map((d) => [
		Number(d[xKey]),
		Number(d[yKey]),
	]) as regression.DataPoint[];
	points.sort((a, b) => a[0] - b[0]); // sort based on xKey

	try {
		const result = regression.linear(points);

		if (!result || !result.equation)
			throw new Error("Invalid regression result");

		const minX = Math.min(...points.map((p) => p[0]));
		const maxX = Math.max(...points.map((p) => p[0]));

		// generate line for graph
		const regressionLine = [
			{ [xKey]: minX, [yKey]: result.predict(minX)[1] },
			{ [xKey]: maxX, [yKey]: result.predict(maxX)[1] },
		];

		return regressionLine;
	} catch (error) {
		console.error("Regression calculation error:", error);
		return [];
	}
};

const ScatterPlot = <T extends Record<string, unknown>>({
	data,
	xAxis,
	yAxis,
	sizeAxis,
	colorAxis,
	showLegend = false,
	mapping = [],
}: ScatterPlotProps<T>): JSX.Element => {
	const regressionData =
		calculateRegression(data, xAxis.toString(), yAxis.toString()) || [];

	return (
		<ResponsiveContainer width="100%" height={350}>
			<ComposedChart
				data={data}
				margin={{ top: 20, right: 20, left: -10, bottom: 50 }}
			>
				<CartesianGrid
					strokeDasharray="3 3"
					stroke="#E5E7EB"
					vertical={false}
				/>

				{/* X Axis */}
				<XAxis dataKey={String(xAxis)} type="number">
					<Label
						value={
							mapping.find((item) => item.key === (xAxis as string))?.value ||
							(xAxis as string)
						}
						position="bottom"
						offset={30}
						style={{ fill: "#6B7280", fontSize: 12 }}
					/>
				</XAxis>

				{/* Y Axis */}
				<YAxis dataKey={String(yAxis)} type="number">
					<Label
						value={
							mapping.find((item) => item.key === (yAxis as string))?.value ||
							(yAxis as string)
						}
						position="left"
						angle={-90}
						style={{ fill: "#6B7280", fontSize: 12 }}
					/>
				</YAxis>

				{/* Optional Legend */}
				{showLegend && <Legend verticalAlign="top" height={36} />}

				{/* Tooltip */}
				<Tooltip />

				{/* Scatter Points */}
				<Scatter
					name="Accident Data"
					data={data}
					fill={colorAxis ? "url(#colorScale)" : "blue"}
					stroke="darkblue"
				/>

				{/* Regression Line */}
				{regressionData.length > 1 && (
					<Line
						data={regressionData}
						dataKey={String(yAxis)}
						stroke="red"
						strokeWidth={2}
						dot={false}
						name="Regression Line"
					/>
				)}
			</ComposedChart>
		</ResponsiveContainer>
	);
};

export default ScatterPlot;
