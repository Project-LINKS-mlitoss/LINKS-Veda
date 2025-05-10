import React, { memo } from "react";
import { Cell, Label } from "recharts";
import {
	Bar,
	BarChart as BarChartBase,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "~/components/atoms/Chart";
import { CustomTooltip } from "../LineChart";
import {
	DEFAULT_AXIS_CONFIG,
	DEFAULT_BAR_CONFIG,
	DEFAULT_MARGINS,
	DEFAULT_X_AXIS_TICK_STYLE,
	DEFAULT_Y_AXIS_TICK_STYLE,
} from "./defaults";
import type { BarChartData, BarChartProps, BarClickData } from "./types";

const BarChart = memo(
	<T extends BarChartData>({
		data,
		xValue,
		yValues,
		showXAxis = true,
		showYAxis = true,
		height = 300,
		width = "100%",
		margins = DEFAULT_MARGINS,
		barConfig = DEFAULT_BAR_CONFIG,
		xAxisTickStyle = DEFAULT_X_AXIS_TICK_STYLE,
		yAxisTickStyle = DEFAULT_Y_AXIS_TICK_STYLE,
		xAxisConfig = DEFAULT_AXIS_CONFIG,
		yAxisConfig = DEFAULT_AXIS_CONFIG,
		activeArea = null,
		onBarClick,
		mapping = [],
	}: BarChartProps<T>): JSX.Element => {
		if (!data || !xValue || !yValues) {
			return <></>;
		}
		const verticalText = ((yValues as string) || "").split("");
		return (
			<ResponsiveContainer width="100%" height={height}>
				<BarChartBase
					data={data}
					margin={margins}
					{...barConfig}
					onClick={(payload) => {
						if (payload?.activePayload?.[0]) {
							onBarClick?.(payload.activePayload[0] as BarClickData);
						}
					}}
				>
					<CartesianGrid
						strokeDasharray="3 3"
						stroke="#E5E7EB"
						vertical={false}
					/>

					{showXAxis && (
						<XAxis
							dataKey={xValue as string}
							tick={xAxisTickStyle}
							axisLine={{ stroke: xAxisConfig.stroke }}
							tickLine={false}
							interval="preserveEnd"
							domain={xAxisConfig.domain}
							tickFormatter={(value: string) =>
								`${String(value)?.slice(0, 8)}...`
							}
						>
							<Label
								value={
									mapping.find((item) => item.key === (xValue as string))
										?.value || (xValue as string)
								}
								position="bottom"
								offset={30}
								style={{ fill: "#6B7280", fontSize: 12 }}
							/>
						</XAxis>
					)}
					{showYAxis && (
						<YAxis
							tick={yAxisTickStyle}
							axisLine={{ stroke: yAxisConfig.stroke }}
							tickLine={false}
							domain={yAxisConfig.domain}
							ticks={yAxisConfig.ticks}
						>
							<Label
								content={({ x, y }) => {
									const text =
										mapping.find((item) => item.key === (yValues as string))
											?.value || (yValues as string);
									return (
										<text
											x={5}
											y={60}
											style={{ fill: "#6B7280", fontSize: 12 }}
										>
											{verticalText.map((char, index) => (
												<tspan
													x={5}
													dx={0}
													dy={`${index === 0 ? 0 : 1.2}em`}
													key={`bar-y-${char}`}
												>
													{char}
												</tspan>
											))}
										</text>
									);
								}}
							/>
						</YAxis>
					)}
					<Tooltip content={<CustomTooltip mapping={mapping} />} />
					<Bar
						dataKey={String(yValues)}
						stackId="a"
						radius={[0, 0, 0, 0]}
						label=""
						cursor="pointer"
						onClick={(payload: BarClickData) => {
							if (payload) {
								onBarClick?.(payload);
							}
						}}
					>
						{data.map((entry) => (
							<Cell
								key={`cell-${String(entry[xValue])}`}
								fill={entry.color} // ✅ ここで `transformStackedBarData` で生成した色を適用
								fillOpacity={entry[xValue] === activeArea ? 1 : 0.5}
							/>
						))}
					</Bar>
				</BarChartBase>
			</ResponsiveContainer>
		);
	},
);

export default BarChart;
