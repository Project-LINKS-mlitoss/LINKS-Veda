import React, { useState } from "react";
import type {
	JSXElementConstructor,
	ReactElement,
	ReactNode,
	ReactPortal,
} from "react";
import {
	Label,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { generatePastelColor } from "../ChartsViewer/transformers";

type ChartData<T extends Record<string, number | string>> = T;

interface DynamicMultiLineChartProps<
	T extends Record<string, number | string>,
> {
	data: ChartData<T>[];
	keys: (keyof T)[];
	xAxisKey: string;
	yAxisLabel: string;
	xAxisLabel: string;
}

interface ScrollableLegendProps {
	payload?: unknown;
	onClickLegendItem?: (value: string) => void;
	hiddenKeys?: Record<string, boolean>;
}

const ScrollableLegend = (props: ScrollableLegendProps) => {
	const { payload, onClickLegendItem, hiddenKeys = {} } = props;
	return (
		<div
			style={{
				width: "100%",
				overflowX: "auto",
				whiteSpace: "wrap",
				paddingTop: 30,
			}}
		>
			{(Array.isArray(payload) ? payload : [])?.map(
				(
					entry: {
						color: string;
						value:
							| string
							| number
							| boolean
							| ReactElement
							| Iterable<ReactNode>
							| ReactPortal
							| null
							| undefined;
					},
					index: number,
				) => {
					const keyStr = String(entry.value);
					const isHidden = hiddenKeys[keyStr];
					return (
						<button
							type="button"
							key={`legend-item-${index}-${entry.value}`}
							style={{
								display: "inline-block",
								marginRight: 20,
								cursor: "pointer",
								opacity: isHidden ? 0.5 : 1,
							}}
							onClick={(e) => {
								e.stopPropagation();
								onClickLegendItem ? onClickLegendItem(keyStr) : null;
							}}
						>
							<span style={{ color: entry.color, marginRight: 5 }}>■</span>
							{entry.value}
						</button>
					);
				},
			)}
		</div>
	);
};

const DynamicTooltip = (props: { active?: boolean; payload?: unknown }) => {
	const { active, payload } = props;
	if (active && payload && Array.isArray(payload) && payload.length) {
		const data = payload[0].payload;
		return (
			<div
				style={{
					backgroundColor: "white",
					padding: 10,
					border: "1px solid #ccc",
					borderRadius: 5,
				}}
			>
				{Object.keys(data).map((key) =>
					data[key] ? (
						<div key={key}>
							<span>{key}:</span> <strong>{data[key]}</strong>
						</div>
					) : null,
				)}
			</div>
		);
	}
	return null;
};

const DynamicMultiLineChart = <T extends Record<string, number | string>>({
	data,
	keys,
	xAxisKey,
	xAxisLabel,
	yAxisLabel,
}: DynamicMultiLineChartProps<T>) => {
	// State to track which keys are hidden
	const [hiddenKeys, setHiddenKeys] = useState<Record<string, boolean>>({});

	// Toggle the hidden state for a given key
	const toggleLine = (key: string) => {
		setHiddenKeys((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

	return (
		<ResponsiveContainer width="100%" height={600}>
			<LineChart
				data={data}
				margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
			>
				<XAxis dataKey={String(xAxisKey)}>
					<Label value={xAxisLabel} offset={-10} position="insideBottom" />
				</XAxis>
				<YAxis>
					<Label
						value={yAxisLabel}
						angle={-90}
						position="insideLeft"
						style={{ textAnchor: "middle" }}
					/>
				</YAxis>
				<Tooltip content={DynamicTooltip} />
				<Legend
					verticalAlign="bottom"
					content={(props) => (
						<ScrollableLegend
							{...props}
							onClickLegendItem={toggleLine}
							hiddenKeys={hiddenKeys}
						/>
					)}
				/>
				{keys.map((key, index) => (
					<Line
						key={String(key)}
						type="monotone"
						dataKey={String(key)}
						stroke={generatePastelColor(index, keys.length)}
						hide={hiddenKeys[String(key)]}
					/>
				))}
			</LineChart>
		</ResponsiveContainer>
	);
};

export default DynamicMultiLineChart;
