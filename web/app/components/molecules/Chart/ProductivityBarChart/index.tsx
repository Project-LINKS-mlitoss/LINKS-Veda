import { Select, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface ProductivityBarChartProps<T> {
	startYear: number;
	endYear: number;
	data: {
		data: T;
		year: number;
	}[];
	metrics: ReadonlyArray<{
		readonly key: keyof T;
		readonly label: string;
	}>;
	dataKey: keyof T;
	valueFormatter?: (value: number) => string;
}

// biome-ignore lint/suspicious/noExplicitAny: due to dummy data
const ProductivityBarChart = <T extends Record<string, any>>({
	startYear,
	endYear,
	data,
	metrics,
	dataKey,
	valueFormatter,
}: ProductivityBarChartProps<T>) => {
	const [selectedMetric, setSelectedMetric] = useState<keyof T>(dataKey);
	const [year, setYear] = useState(startYear);
	const [count, setCount] = useState(5);

	useEffect(() => {
		if (year < startYear || year > endYear) setYear(startYear);
	}, [startYear, endYear, year]);

	const barChartData = useMemo(() => {
		return (
			data
				.find((value) => value.year === year)
				?.data[selectedMetric].slice(0, count) || []
		);
	}, [year, selectedMetric, data, count]);

	if (barChartData.length === 0) return null;

	return (
		<>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					flexWrap: "wrap",
					gap: 12,
					marginBottom: 12,
				}}
			>
				<Select
					style={{ width: 200 }}
					value={selectedMetric as string}
					onChange={(value) => setSelectedMetric(value as keyof T)}
					options={metrics.map((m) => ({
						label: m.label,
						value: m.key as string,
					}))}
				/>
				<Select
					value={year}
					onChange={(value) => setYear(value)}
					options={Array.from(
						{ length: endYear - startYear + 1 },
						(_, index) => startYear + index,
					).map((m) => ({
						label: m,
						value: m,
					}))}
				/>
				<div>
					<Typography.Text>表示件数</Typography.Text>
					<Select
						style={{ marginLeft: 8 }}
						value={count}
						onChange={(value) => setCount(value)}
						options={[5, 10, 20].map((m) => ({ label: m, value: m }))}
					/>
				</div>
			</div>

			<ResponsiveContainer width="100%" height={300}>
				<BarChart data={barChartData}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="name" />
					<YAxis tickFormatter={valueFormatter} />
					<Tooltip
						formatter={(value) => valueFormatter?.(Number(value)) ?? value}
					/>
					<Bar dataKey="value" fill="#8884d8" />
				</BarChart>
			</ResponsiveContainer>
		</>
	);
};

export default ProductivityBarChart;
