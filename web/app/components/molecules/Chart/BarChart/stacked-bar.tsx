import type {
	JSXElementConstructor,
	ReactElement,
	ReactNode,
	ReactPortal,
} from "react";
import {
	Bar,
	BarChart,
	Label,
	Legend,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { generatePastelColor } from "../ChartsViewer/transformers";

type ChartData<T extends Record<string, number | string>> = T;

interface DynamicStackedBarChartProps<
	T extends Record<string, number | string>,
> {
	data: ChartData<T>[];
	keys: (keyof T)[];
	xAxisKey: string;
	yAxisLabel: string;
	xAxisLabel: string;
}

const ScrollableLegend = (props: { payload?: unknown }) => {
	const { payload } = props;
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
							| ReactElement<unknown, string | JSXElementConstructor<unknown>>
							| Iterable<ReactNode>
							| ReactPortal
							| null
							| undefined;
					},
					index: number,
				) => (
					<span
						key={`legend-item-${index}-${entry.value}`}
						style={{
							display: "inline-block",
							marginRight: 20,
						}}
					>
						<span style={{ color: entry.color, marginRight: 5 }}>■</span>
						{entry.value}
					</span>
				),
			)}
		</div>
	);
};

const formatJapaneseNumber = (value: number | string) => {
	const num = typeof value === "number" ? value : Number(value);
	if (Number.isNaN(num)) return String(value);

	if (num >= 100000000) {
		return `${(num / 100000000).toFixed(3)}億`;
	}
	if (num >= 10000) {
		return `${(num / 10000).toFixed(3)}万`;
	}
	return num.toLocaleString("ja-JP");
};

const DynamicStackedBarChart = <T extends Record<string, number | string>>({
	data,
	keys,
	xAxisKey,
	xAxisLabel,
	yAxisLabel,
}: DynamicStackedBarChartProps<T>) => {
	const sumObjectValues = (
		obj: { [s: string]: unknown } | ArrayLike<unknown>,
	) => {
		return Object.entries(obj).reduce((count, [key, value]) => {
			if (typeof value === "number") {
				return count + value;
			}
			return count;
		}, 0);
	};

	const sortedData = data.sort(
		(a, b) => sumObjectValues(b) - sumObjectValues(a),
	);

	return (
		<ResponsiveContainer width="100%" height={600}>
			<BarChart
				data={sortedData}
				margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
			>
				<XAxis dataKey={String(xAxisKey)}>
					<Label value={xAxisLabel} offset={-10} position="insideBottom" />
				</XAxis>
				<YAxis tickFormatter={formatJapaneseNumber}>
					<Label
						value={yAxisLabel}
						angle={-90}
						position="insideLeft"
						style={{ textAnchor: "middle" }}
					/>
				</YAxis>
				<Tooltip
					formatter={(value) =>
						typeof value === "number" ? formatJapaneseNumber(value) : value
					}
				/>
				<Legend verticalAlign="bottom" content={ScrollableLegend} />
				<ReferenceLine y={0} stroke="black" strokeWidth={1} />
				{keys.map((key, index) => (
					<Bar
						key={String(key)}
						dataKey={String(key)}
						stackId="a"
						fill={generatePastelColor(index, keys.length)}
					/>
				))}
			</BarChart>
		</ResponsiveContainer>
	);
};

export default DynamicStackedBarChart;
