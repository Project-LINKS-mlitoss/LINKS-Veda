import { Label } from "recharts";
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "~/components/atoms/Chart";
import { DEFAULT_X_AXIS_TICK_STYLE } from "../BarChart/defaults";
import type { LineChartProps } from "./types";

interface CustomTooltipProps {
	active?: boolean;
	payload?: { name: string; value: number }[];
	label?: string;
	mapping?: { key: string; value: string }[];
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
	active,
	payload,
	label,
	mapping = [],
}) => {
	const getText = (text: string) => {
		return mapping.find((item) => item.key === (text as string))?.value || text;
	};
	if (active && payload && payload.length) {
		return (
			<div
				style={{
					background: "#fff",
					border: "1px solid #ccc",
					padding: "10px",
					borderRadius: "5px",
				}}
			>
				{payload.map((data, index) => (
					<p key={data.name} style={{ margin: 0 }}>
						{`${getText(data.name)}: ${data.value}`}
					</p>
				))}
			</div>
		);
	}

	return null;
};

// biome-ignore lint/suspicious/noExplicitAny: FIXME
const MultiLineChart = <T extends Record<string, any>>({
	data,
	xAxis,
	yAxes,
	isDot,
	showLegend = false,
	mapping = [],
}: LineChartProps<T>): JSX.Element => {
	return (
		<ResponsiveContainer width="100%" height={300}>
			<LineChart
				data={data}
				margin={{
					top: 20,
					right: 10,
					left: -10,
					bottom: 50,
				}}
			>
				<CartesianGrid
					strokeDasharray="3 3"
					stroke="#E5E7EB"
					vertical={false}
				/>
				<XAxis
					dataKey="name"
					tick={DEFAULT_X_AXIS_TICK_STYLE}
					tickFormatter={(value) => `${String(value).substring(0, 10)}...`}
				>
					<Label
						value={mapping.find((item) => item.key === xAxis)?.value || xAxis}
						position="bottom"
						offset={30}
						style={{ fill: "#6B7280", fontSize: 10 }}
					/>
				</XAxis>
				<YAxis
					tick={{
						fill: "#6B7280",
						fontSize: 10,
						textAnchor: "end",
					}}
				>
					<Label
						content={({ x, y }) => {
							const text =
								mapping.find((item) => item.key === yAxes)?.value || yAxes;
							const verticalText = text.split(""); // Split the string into individual characters

							return (
								<text x={0} y={60} style={{ fill: "#6B7280", fontSize: 12 }}>
									{verticalText.map((char, index) => (
										<tspan
											x={0}
											dx={0}
											dy={`${index === 0 ? 0 : 1.2}em`}
											key={`line-y-${char}`}
										>
											{char}
										</tspan>
									))}
								</text>
							);
						}}
					/>
				</YAxis>
				<Tooltip content={<CustomTooltip mapping={mapping} />} />
				{showLegend && <Legend />}
				<Line
					type="monotone"
					dataKey="value"
					stroke={`rgba(0, 50, 255, ${0.5})`}
					strokeWidth={2}
					name={yAxes}
					dot={isDot}
				/>
			</LineChart>
		</ResponsiveContainer>
	);
};

export default MultiLineChart;
