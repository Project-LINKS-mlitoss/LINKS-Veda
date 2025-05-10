import { Empty } from "antd";
import Modal from "app/components/atoms/Modal";
import dayjs from "dayjs";
import type { Feature, GeoJsonProperties, Geometry } from "geojson";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	CartesianGrid,
	Line,
	LineChart as RechartsLineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import Icon from "~/components/atoms/Icon";
import BarChart from "~/components/molecules/Chart/BarChart";
import CustomLegend from "~/components/molecules/Chart/CustomLegend";
import LineChart from "~/components/molecules/Chart/LineChart";
import PieChart from "~/components/molecules/Chart/PieChart";
import WrapViewer from "~/components/molecules/Common/WrapViewer";
import type { GeoJSONFeature } from "~/components/pages/Visualizations/types";
import DynamicStackedBarChart from "../BarChart/stacked-bar";
import DynamicMultiLineChart from "../LineChart/multi-line-chart";
import ScatterPlot from "../ScatterPlotChart";
import { regressionYX3 } from "./regression1602";
import { ChartContainer, ChartsWrapper, Scrollable } from "./styled";
import {
	transformLineChartData,
	transformPieChartData,
	transformStackedBarData,
	uc16PieChartTransformedData,
} from "./transformers";
import type { ChartViewerProps, ChartsFormType } from "./type";

const ChartViewer = <T extends ChartsFormType>({
	charts,
	data,
	onChartSelect,
	onChartDelete,
	flightData,
	flightRoutePlans,
	flightPlansForGraph,
	searchParams,
	regressionData, // regression chart data selected from fields value
	uc16PieChart = false,
	setRegressionFieldsData,
	uavAccidentDataForGraph,
	readonly,
}: ChartViewerProps<T>) => {
	const [filteredFlightData, setfilteredFlightData] = useState<
		Feature<Geometry, GeoJsonProperties>[] | undefined
	>(undefined);
	const [filteredFlightRoutePlans, setfilteredFlightRoutePlans] = useState<
		GeoJsonProperties[] | undefined
	>(undefined);

	const [timeStamp, setTimeStamp] = useState<string>("");
	const hasNoCharts = charts.length === 0 && !searchParams?.date;

	// if (charts.length === 0 && !searchParams?.date) {
	// 	return (
	// 		<WrapViewer
	// 			title="グラフパネル"
	// 			icon={<Icon icon="chartBar" size={16} />}
	// 			isShowShrinkOutlined
	// 		>
	// 			<ChartsWrapper>
	// 				<Empty
	// 					description="チャートを追加してください"
	// 					image={Empty.PRESENTED_IMAGE_SIMPLE}
	// 				/>
	// 			</ChartsWrapper>
	// 		</WrapViewer>
	// 	);
	// }

	const filterFlightData = useCallback(() => {
		if (
			!flightData ||
			!searchParams?.date ||
			searchParams.date.includes("undefined")
		) {
			setfilteredFlightData(flightData);
			return;
		}

		const [startDateStr, endDateStr] = searchParams.date.split("/");
		const startDate = dayjs(startDateStr).startOf("day");
		const endDate = dayjs(endDateStr).endOf("day");

		const filtered = flightData.filter((feature) => {
			const occurrenceDate = dayjs(
				feature.properties?.発生日時 || feature.properties?.発生日時_y,
			);
			return (
				occurrenceDate.isValid() &&
				occurrenceDate.unix() >= startDate.unix() &&
				occurrenceDate.unix() <= endDate.unix()
			);
		});

		const now = dayjs();
		setTimeStamp(now.format("YYYY/MM/DD:HH:mm"));

		setfilteredFlightData(filtered);
	}, [flightData, searchParams?.date]);

	const filterFlightPlanRouteData = useCallback(() => {
		if (!flightRoutePlans || !searchParams?.date) {
			return;
		}

		const [startDateStr, endDateStr] = searchParams.date.split("/");
		const startDate = dayjs(startDateStr).startOf("day");
		const endDate = dayjs(endDateStr).endOf("day");

		const filtered = flightRoutePlans.filter((feature) => {
			const occurrenceDate = dayjs(
				feature?.飛行日時開始 || feature?.飛行予定日時開始,
			);
			return (
				occurrenceDate.isValid() &&
				occurrenceDate.unix() >= startDate.unix() &&
				occurrenceDate.unix() <= endDate.unix()
			);
		});

		const now = dayjs();
		setTimeStamp(now.format("YYYY/MM/DD:HH:mm"));

		setfilteredFlightRoutePlans(filtered);
	}, [flightRoutePlans, searchParams?.date]);

	useEffect(() => {
		if (flightData && searchParams) {
			filterFlightData();
		}
	}, [filterFlightData, flightData, searchParams]);

	useEffect(() => {
		if (flightRoutePlans && searchParams) {
			filterFlightPlanRouteData();
		}
	}, [filterFlightPlanRouteData, flightRoutePlans, searchParams]);

	const regression = useMemo(
		() => regressionYX3(regressionData, flightData),
		[flightData, regressionData],
	);

	const monthlyData = useMemo(() => {
		if (!filteredFlightData) return [];

		// Create 12 month slots labeled "01" through "12"
		let monthSlots = Array.from({ length: 12 }, (_, i) => ({
			month: `${String(i + 1).padStart(2, "0")}`,
			count: 0,
		}));

		// Iterate through the flight data
		for (let i = 0; i < filteredFlightData.length; i++) {
			const flight = filteredFlightData[i];
			const dateTime =
				flight.properties?.発生日時 || flight.properties?.発生日時_y;
			if (dateTime) {
				// dayjs().month() returns a zero-indexed month (0 for January, 11 for December)
				const month = dayjs(dateTime).month();
				monthSlots[month].count++;
			}
		}

		monthSlots = monthSlots.map((res) => ({
			...res,
			month: dayjs()
				.month((res.month as unknown as number) - 1 || 0)
				.format("MMMM"),
		}));

		return monthSlots;
	}, [filteredFlightData]);

	const flightPlanMonthlyData = useMemo(() => {
		if (!filteredFlightRoutePlans) return [];

		// Create 12 month slots labeled "01" through "12"
		let monthSlots = Array.from({ length: 12 }, (_, i) => ({
			month: `${String(i + 1).padStart(2, "0")}`,
			count: 0,
		}));

		// Iterate through the flight data
		for (let i = 0; i < filteredFlightRoutePlans.length; i++) {
			const flight = filteredFlightRoutePlans[i];
			const dateTime = flight?.飛行日時開始 || flight?.飛行予定日時開始;
			if (dateTime) {
				// dayjs().month() returns a zero-indexed month (0 for January, 11 for December)
				const month = dayjs(dateTime).month();
				monthSlots[month].count++;
			}
		}

		monthSlots = monthSlots.map((res) => ({
			...res,
			month: dayjs()
				.month((res.month as unknown as number) - 1 || 0)
				.format("MMMM"),
		}));

		return monthSlots;
	}, [filteredFlightRoutePlans]);

	const handleDeleteScatterChart = useCallback(
		(xAxis: string) => {
			Modal.confirm({
				title: "チャートを削除",
				content: "このチャートを削除してもよろしいですか？",
				okText: "削除",
				cancelText: "キャンセル",
				okButtonProps: { danger: true },
				onOk: () => {
					setRegressionFieldsData?.((prev) => {
						if (!prev) return prev;
						const newFields = { ...prev };
						if (xAxis === prev.regressionX1) {
							newFields.regressionX1 = "";
						}
						if (xAxis === prev.regressionX2) {
							newFields.regressionX2 = "";
						}
						if (xAxis === prev.regressionX3) {
							newFields.regressionX3 = "";
						}
						return newFields;
					});
				},
			});
		},
		[setRegressionFieldsData],
	);

	return (
		<WrapViewer
			title="グラフパネル"
			icon={<Icon icon="chartBar" size={16} />}
			isShowShrinkOutlined
		>
			<ChartsWrapper>
				{hasNoCharts ? (
					<Empty
						description="チャートを追加してください"
						image={Empty.PRESENTED_IMAGE_SIMPLE}
					/>
				) : (
					<Scrollable>
						{charts.map((chart: T) => {
							const isUc16BarChart = uc16PieChart && chart.type === "bar";
							const isUc16LineChart = uc16PieChart && chart.type === "line";

							return (
								<ChartContainer
									key={chart.id}
									className={chart.isSelected ? "selected" : ""}
									onClick={() => !readonly && onChartSelect(chart.id)}
								>
									<div className="chart-header" style={{ marginBottom: 0 }}>
										<h3 className="mb-0">{chart.title}</h3>
										{!readonly && (
											<div className="flex items-center gap-2">
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														onChartDelete(chart.id);
													}}
													className="delete-button"
												>
													<Icon icon="delete" size={16} />
												</button>
											</div>
										)}
									</div>

									<div
										className="chart-content w-full"
										style={{
											alignItems: "center",
											display:
												isUc16BarChart || isUc16LineChart ? "block" : "flex",
										}}
									>
										<div
											className={`${isUc16BarChart || isUc16LineChart ? "w-full" : "!w-8/12"} chart-area`}
											style={{ display: "flex", alignItems: "center" }}
										>
											{chart.type === "pie" &&
												(() => {
													const pieChartData = uc16PieChart
														? uc16PieChartTransformedData(
																chart.data ?? data,
																chart.xAxis,
															)
														: transformPieChartData(
																chart.data ?? data,
																chart.xAxis,
																uc16PieChart,
															);

													return (
														<PieChart
															data={pieChartData}
															selectedKey={chart.xAxis}
														/>
													);
												})()}

											{chart.type === "bar" &&
												(() => {
													if (uc16PieChart) {
														return (
															<div className="position-relative w-full">
																<DynamicStackedBarChart
																	data={
																		(chart.data || []) as unknown as Record<
																			string,
																			string | number
																		>[]
																	}
																	keys={
																		((chart as ChartsFormType)?.stackKeys
																			?.length
																			? chart.stackKeys
																			: ["その他"]) as string[]
																	}
																	xAxisKey={chart.xAxis}
																	yAxisLabel={chart.yAxis}
																	xAxisLabel={chart.xAxis}
																/>
															</div>
														);
													}
													const chartData = transformStackedBarData(
														chart.data ?? data,
														chart.xAxis,
														chart.yAxis,
														uc16PieChart,
													);
													return (
														<BarChart
															//@ts-ignore
															data={chartData}
															xValue={chart.xAxis}
															yValues={chart.yAxis}
															mapping={chart?.mapping || []}
														/>
													);
												})()}

											{chart.type === "line" &&
												(() => {
													if (uc16PieChart) {
														return (
															<div className="position-relative w-full">
																<DynamicMultiLineChart
																	data={
																		(chart.data || []) as unknown as Record<
																			string,
																			string | number
																		>[]
																	}
																	keys={
																		((chart as ChartsFormType)?.stackKeys
																			?.length
																			? chart.stackKeys
																			: ["No. of accidents"]) as string[]
																	}
																	xAxisKey={chart.xAxis}
																	yAxisLabel={chart.yAxis}
																	xAxisLabel={chart.xAxis}
																/>
															</div>
														);
													}
													// const { transformedData, mappings } =
													// 	transformLineChartData(
													// 		data as unknown as Record<string, unknown>[],
													// 		[chart.yAxis],
													// 	);
													const chartData = transformLineChartData(
														chart.data ?? data,
													);
													return (
														<LineChart
															data={chartData}
															xAxis={chart.xAxis}
															yAxes={chart.yAxis}
															mapping={[]}
														/>
													);
												})()}
										</div>

										<div className="!w-4/12">
											{(!uc16PieChart ||
												!(
													uc16PieChart &&
													(chart.type === "bar" || chart.type === "line")
												)) && (
												<CustomLegend
													flightData={chart.data as unknown as GeoJSONFeature[]}
													data={chart.data ?? data}
													chart={chart}
													mapping={chart?.mapping || []}
													uc16PieChart={uc16PieChart}
												/>
											)}
										</div>
									</div>
								</ChartContainer>
							);
						})}
						{searchParams?.date && uc16PieChart && (
							<ChartContainer>
								<div className="chart-header">
									<h3>
										月別の事故件数 -<b>{timeStamp}</b>
									</h3>
								</div>
								<div className="chart-content w-full">
									<ResponsiveContainer width="100%" height={300}>
										<RechartsLineChart
											data={monthlyData}
											margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
										>
											<CartesianGrid
												strokeDasharray="3 3"
												stroke="#e0e0e0"
												vertical={false}
											/>
											<XAxis
												dataKey="month"
												tickLine={false}
												axisLine={{ stroke: "#e0e0e0" }}
												interval={2}
												tick={{ fontSize: 12 }}
											/>
											<YAxis
												tickLine={false}
												axisLine={{ stroke: "#e0e0e0" }}
												label={{
													value: "事故件数",
													angle: -90,
													position: "insideLeft",
												}}
											/>
											<Tooltip />
											<Line
												type="monotone"
												dataKey="count"
												stroke="#4f46e5"
												strokeWidth={2}
												dot={true}
											/>
										</RechartsLineChart>
									</ResponsiveContainer>
								</div>

								<div className="chart-header">
									<h3>
										数月別の飛行計画件数 -<b>{timeStamp}</b>
									</h3>
								</div>
								<div className="chart-content w-full">
									<ResponsiveContainer width="100%" height={300}>
										<RechartsLineChart
											data={flightPlanMonthlyData}
											margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
										>
											<CartesianGrid
												strokeDasharray="3 3"
												stroke="#e0e0e0"
												vertical={false}
											/>
											<XAxis
												dataKey="month"
												tickLine={false}
												axisLine={{ stroke: "#e0e0e0" }}
												interval={2}
												tick={{ fontSize: 12 }}
											/>
											<YAxis
												tickLine={false}
												axisLine={{ stroke: "#e0e0e0" }}
												label={{
													value: "飛行計画数",
													angle: -90,
													position: "insideLeft",
												}}
											/>
											<Tooltip />
											<Line
												type="monotone"
												dataKey="count"
												stroke="#4f46e5"
												strokeWidth={2}
												dot={true}
											/>
										</RechartsLineChart>
									</ResponsiveContainer>
								</div>

								{(regressionData?.regressionX1 ||
									regressionData?.regressionX2 ||
									regressionData?.regressionX3) &&
									regressionData.regressionY && (
										<div className="mt-4 grid grid-cols-1 gap-2">
											{!regression.graph1.length &&
											!regression.graph2.length &&
											!regression.graph3.length ? (
												<div className="text-center bg-slate-400/25 py-4">
													No data found for the regression fields you have
													selected
												</div>
											) : (
												<h3 className="font-semibold">
													重回帰分析結果_{regressionData?.regressionY}_{" "}
													<b>{timeStamp}</b>
												</h3>
											)}
											{[
												{
													data: regression.graph1,
													xAxis: regressionData?.regressionX1,
												},
												{
													data: regression.graph2,
													xAxis: regressionData?.regressionX2,
												},
												{
													data: regression.graph3,
													xAxis: regressionData?.regressionX3,
												},
											].map(
												({ data, xAxis }, index) =>
													data.length > 0 && (
														<div key={`${index}_${xAxis}_Math.random()`}>
															<div
																className="chart-header w-full"
																style={{ marginBottom: 0 }}
															>
																{!readonly && (
																	<div className="flex items-center gap-2 w-full justify-end">
																		<button
																			type="button"
																			onClick={(e) => {
																				e.stopPropagation();
																				if (xAxis) {
																					handleDeleteScatterChart(xAxis);
																				}
																			}}
																			className="delete-button"
																		>
																			<Icon icon="delete" size={16} />
																		</button>
																	</div>
																)}
															</div>
															<ScatterPlot
																showLegend
																data={data}
																xAxis={xAxis || ""}
																yAxis={regressionData?.regressionY || ""}
															/>
														</div>
													),
											)}
										</div>
									)}
							</ChartContainer>
						)}
					</Scrollable>
				)}
			</ChartsWrapper>
		</WrapViewer>
	);
};

export default ChartViewer;
