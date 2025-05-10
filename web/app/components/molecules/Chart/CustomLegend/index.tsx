import type { GeoJSONFeature } from "~/components/pages/Visualizations/types";
import {
	transformPieChartData,
	transformStackedBarData,
	uc16PieChartTransformedData,
} from "../ChartsViewer/transformers";
import type { ChartConfig } from "./types";

const generateColor = (index: number): string => {
	return `rgba(0, 0, 255, ${0.5 + ((index * 2) % 10) / 10})`;
};

const calculateLegendData = <
	T extends { fields: Array<{ key: string; value: string }> },
>(
	data: T[],
	type: "line" | "bar" | "pie",
	xAxis: keyof T,
	yAxis: keyof T,
	uc16PieChart?: boolean,
	flightData?: GeoJSON.GeoJsonProperties[],
) => {
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	const getFieldValue = (item: T, key: keyof T): any => {
		return item[key];
	};

	if (type === "pie") {
		if (!xAxis) return [];

		return uc16PieChart
			? uc16PieChartTransformedData(
					flightData as unknown as GeoJSON.GeoJsonProperties[],
					xAxis.toString(),
				)
			: transformPieChartData(data, xAxis as string, uc16PieChart);
	}

	// if (type === "line") {

	// 	const values = data
	// 		.map((item) => {
	// 			const countField = item.fields.find((f) => f.key === "count");
	// 			return Number(countField?.value || 0);
	// 		})
	// 		.filter((val) => !Number.isNaN(val));

	// 	return [
	// 		{
	// 			name: uc16PieChart ? "事故件数" : String(group[xAxis as keyof typeof group]),
	// 			value:
	// 				values.length > 0
	// 					? (
	// 							values.reduce((sum, val) => sum + val, 0) / values.length
	// 						).toFixed(1)
	// 					: "0",
	// 			color: "rgb(79, 70, 229)",
	// 		},
	// 	];
	// }
	const groupedData = transformStackedBarData(
		data,
		xAxis as string,
		yAxis as string,
	);
	const legendData = groupedData.map((group, index) => ({
		name: String(group[xAxis as keyof typeof group]),
		value: Number(group[yAxis as keyof typeof group]).toFixed(1),
		color:
			type === "line"
				? "rgb(79, 70, 229)"
				: group.color || generateColor(index),
	}));

	return legendData;
};

const CustomLegend = <
	T extends { fields: Array<{ key: string; value: string }> },
>({
	data,
	chart,
	showAverage = true,
	unit = "",
	mapping = [],
	uc16PieChart = false,
	flightData,
}: ChartConfig<T>): JSX.Element => {
	const { type, xAxis, yAxis, details = "", city = "" } = chart;
	const legendData = calculateLegendData(
		data,
		type,
		xAxis,
		yAxis,
		uc16PieChart,
		flightData,
	);
	const xLabel = mapping.find((item) => item.key === xAxis)?.value || xAxis;
	const ave =
		legendData.reduce((sum, item) => sum + Number(item.value), 0) /
		legendData.length;
	return (
		<div className="flex flex-col text-gray-600 m-5 text-[12px]">
			<div className="mb-2 flex justify-between">
				<span className="flex text-[12px]">
					{city || details
						? `${city as string} ${details as string}`
						: `${chart?.mapping?.[0]?.value ?? (xLabel as string)}`}
				</span>
				<span className="flex text-[12px]">{chart?.mapping?.[1]?.value}</span>
			</div>
			<div className="h-px bg-gray-200" />

			<div className="space-y-3 mt-2">
				{legendData.map((item, index) => (
					<div
						key={`${item.value}-${item.color}-${index}`}
						className="flex items-center gap-2"
						title={item.name}
					>
						<div
							className="w-3 h-3 rounded-full shrink-0"
							style={{ backgroundColor: item.color }}
						/>
						<span
							className="w-5/12 font-medium overflow-hidden text-ellipsis line-clamp-2 hover:whitespace-normal"
							style={{
								display: "-webkit-box",
								WebkitLineClamp: 2,
								WebkitBoxOrient: "vertical",
							}}
						>
							{item.name}
							{unit}
						</span>
						<span className="text-gray-500 w-5/12">{item.value}</span>
					</div>
				))}
			</div>

			{showAverage && (
				<div className="mt-4 pt-4 border-t border-gray-200">
					<div className="flex items-center">
						<span className="w-6/12 font-medium">平均</span>
						<span className="text-gray-500 w-6/12">
							{ave.toFixed(1)}
							{unit}
						</span>
					</div>
				</div>
			)}
		</div>
	);
};

export default CustomLegend;
