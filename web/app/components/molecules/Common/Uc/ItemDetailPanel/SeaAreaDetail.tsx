import { Tooltip as AntdTooltip, Empty, Flex, Modal, Table } from "antd";
// types
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { ResponsiveContainer } from "~/components/atoms/Chart";
import Select from "~/components/atoms/Select";
import BarChart from "~/components/molecules/Chart/BarChart";
import { accidentTypeOptions } from "~/components/pages/Visualizations/UC14/UFN001v2/_mock";
import type {
	GraphProps,
	PropertyValue,
} from "~/components/pages/Visualizations/UC14/UFN001v2/types";
import type { AccidentFeature } from "~/components/pages/Visualizations/types";
// hooks
import { useAccidentDataForSeaArea } from "./hooks/useAccidentDataForSeaArea";
import { useGraphDataForSeaArea } from "./hooks/useGraphDataForSeaArea";
import { useSeaAreaData } from "./hooks/useSeaAreaData";
// styled
import {
	BarContainer,
	BarupContainer,
	Contain,
	Line as DevidedLine,
	Link,
	ResultContainer,
	TopContainer,
	Typo,
} from "./styled";
import type { SeaAreaChartsProps } from "./types";
import { generateJtsbUrl } from "./utils/generateJtsbUrl";
// util

const SeaAreaDetail = ({
	graphData,
	seaAreas,
	formData,
	seaAreaName,
	accidentReports,
	meshData,
}: GraphProps) => {
	const {
		seaAreaData,
		formDataState,
		selectedSeaArea,
		handleBarClick,
		isLoading,
	} = useSeaAreaData(graphData, seaAreas, formData, seaAreaName);
	// const { filteredAccidents } = useAccidentDataForSeaArea(
	// 	accidentReports,
	// 	selectedSeaArea,
	// 	formDataState,
	// 	null,
	// );
	const [filteredAccidents, setFilteredAccidents] = useState<AccidentFeature[]>(
		[],
	);
	const { averageValues } = useGraphDataForSeaArea(
		selectedSeaArea,
		formDataState,
		meshData,
	);
	const [selectedAccidentType, setSelectedAccidentType] = useState<
		string | null
	>(null);
	const [isChartReady, setIsChartReady] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [modalContent, setModalContent] = useState("");
	const [graphContent, setGraphContent] = useState<
		"windSpeedAve" | "waveHeightAve" | "visibilityAve"
	>("windSpeedAve");

	useEffect(() => {
		if (accidentReports && seaAreaName && formDataState) {
			const fromDate = formDataState.dateFromSectionMesh
				?.startOf("day")
				.toDate();
			const toDate = formDataState.dateToSectionMesh?.endOf("day").toDate();

			const filtered = accidentReports.filter((report) => {
				const dateKey = Object.keys(report.properties).find(
					(key) => key.replace(/^\ufeff/, "") === "発生日時",
				);
				const rawDate = dateKey ? report.properties[dateKey] : null;

				// Clean BOM from the date value
				const cleanDateStr = rawDate ? rawDate.replace(/^\ufeff/, "") : "";
				const reportDate = new Date(cleanDateStr); //

				const matchesSeaArea = Array.isArray(report.properties.name)
					? report.properties.name.includes(seaAreaName)
					: report.properties.name === seaAreaName;
				const withinDateRange =
					(!fromDate || reportDate >= fromDate) &&
					(!toDate || reportDate <= toDate);
				const matchesAccidentType =
					selectedAccidentType && selectedAccidentType !== "全て"
						? report?.properties?.事故分類_1 === selectedAccidentType
						: true;
				return matchesSeaArea && withinDateRange && matchesAccidentType;
			});
			setFilteredAccidents(filtered);
		}
	}, [accidentReports, formDataState, selectedAccidentType, seaAreaName]);

	const handleTextExpand = (text: string) => {
		setModalContent(text);
		setIsModalVisible(true);
	};

	const handleAccidentTypeSelect = (type: string) => {
		setSelectedAccidentType(type);
	};

	const chartData = useMemo(() => {
		if (!seaAreaName || !formDataState) return [];
		setIsChartReady(true);
		return [
			{
				key: `${seaAreaName}-${formDataState.dateFromSectionMesh?.format("YYYYMMDD")}`,
				name: seaAreaName,
				seaAreaCode: seaAreaData?.find(
					(area) => area.properties?.name === seaAreaName,
				)?.properties?.code,
				accidentCount: filteredAccidents.length,
				value: filteredAccidents.length,
			},
		];
	}, [filteredAccidents.length, seaAreaName, formDataState, seaAreaData]);

	// Data related to bottom table
	const accidentColumns = useMemo(() => {
		if (!filteredAccidents.length) {
			return [
				{
					title: "No Data",
					dataIndex: "key",
					key: "no-data",
					render: () => "不明",
				},
			];
		}

		const firstAccidentProperties = filteredAccidents[0]?.properties;

		if (!firstAccidentProperties) return [];

		return Object.keys(firstAccidentProperties).map((key) => ({
			title: key,
			dataIndex: ["properties", key], // Access nested 'properties' fields
			key: `${key}-${Math.random()}`, //
			ellipsis: true,
			render: (value: PropertyValue) => {
				const url = key.includes("ファイル名")
					? generateJtsbUrl(String(value))
					: null;
				if (url) {
					return (
						<AntdTooltip title={value}>
							<a
								href={url}
								target="_blank"
								rel="noopener noreferrer"
								style={{ color: "blue", textDecoration: "underline" }}
							>
								{value}
							</a>
						</AntdTooltip>
					);
				}
				return typeof value === "string" && value.length > 20 ? (
					<AntdTooltip title={value}>
						<span
							style={{
								cursor: "pointer",
								textDecoration: "underline",
								color: "blue",
							}}
						>
							{value.substring(0, 20)}...
						</span>
					</AntdTooltip>
				) : (
					value || "N/A"
				);
			},
		}));
	}, [filteredAccidents]);
	// Line Chart
	const lineChartData = useMemo(() => {
		if (!formData?.dateFromSectionMesh || !formData?.dateToSectionMesh)
			return [];

		const startDate = formData.dateFromSectionMesh.format("YYYY-MM-DD");
		const endDate = formData.dateToSectionMesh.format("YYYY-MM-DD");

		const dateRange = [];
		let currentDate = dayjs(startDate); // Convert string to dayjs object

		while (
			currentDate.isBefore(endDate) ||
			currentDate.isSame(endDate, "day")
		) {
			dateRange.push(currentDate.format("YYYY-MM-DD"));
			currentDate = currentDate.add(1, "day");
		}

		const isValidValue = (value: number) => {
			const numStr = value.toString();
			const nineCount = numStr.split("").filter((char) => char === "9").length;
			return nineCount <= 2; // Valid if it has two or fewer '9's
		};

		const filteredData = meshData
			?.filter((mesh) => {
				if (!mesh?.properties?.date) {
					return false; // Skip if mesh or properties are undefined
				}

				// Filter by seaName
				if (mesh.properties.name !== seaAreaName) {
					return false; // Skip if mesh name doesn't match seaName
				}

				const meshDate = dayjs(mesh.properties.date);

				return (
					(meshDate.isAfter(startDate, "day") ||
						meshDate.isSame(startDate, "day")) &&
					(meshDate.isBefore(endDate, "day") || meshDate.isSame(endDate, "day"))
				);
			})
			.reduce<
				Record<
					string,
					{
						windSpeed: number;
						waveHeight: number;
						visibility: number;
						count: number;
						name: string;
					}
				>
			>((acc, mesh) => {
				const meshDate = mesh.properties.date;

				if (!acc[meshDate]) {
					acc[meshDate] = {
						name: meshDate,
						windSpeed: 0,
						waveHeight: 0,
						visibility: 0,
						count: 0,
					};
				}

				if (isValidValue(mesh.properties.風速)) {
					acc[meshDate].windSpeed += mesh.properties.風速;
				}

				if (isValidValue(mesh.properties.波高)) {
					acc[meshDate].waveHeight += mesh.properties.波高;
				}

				if (isValidValue(mesh.properties.視程)) {
					acc[meshDate].visibility += mesh.properties.視程;
				}

				if (
					isValidValue(mesh.properties.風速) ||
					isValidValue(mesh.properties.波高) ||
					isValidValue(mesh.properties.視程)
				) {
					acc[meshDate].count += 1;
				}

				return acc;
			}, {});
		// Compute averages for each date
		return Object.values(filteredData ?? {}).map((entry) => ({
			name: entry.name,
			windSpeed: entry.count
				? Number.parseFloat((entry.windSpeed / entry.count).toFixed(1))
				: 0,
			waveHeight: entry.count
				? Number.parseFloat((entry.waveHeight / entry.count).toFixed(1))
				: 0,
			visibility: entry.count
				? Number.parseFloat((entry.visibility / entry.count).toFixed(1))
				: 0,
		}));
	}, [meshData, formData, seaAreaName]);

	return (
		<Contain>
			{isLoading ? (
				<div
					style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						height: "400px",
					}}
				>
					読込中...
				</div>
			) : (
				<>
					<h1>海域詳細: {seaAreaName}</h1>
					<Contain>
						<TopContainer>
							{formDataState?.dateFromSectionMesh && (
								<>
									<ResultContainer>
										<Typo>対象期間</Typo>
										<Typo>海域</Typo>
										<Typo>期間内の平均風速</Typo>
										<Typo>期間内の平均波高</Typo>
										<Typo>期間内の平均視程</Typo>
									</ResultContainer>
									<ResultContainer>
										<Typo>
											{formDataState.dateFromSectionMesh
												? formDataState.dateFromSectionMesh.format("YYYY/MM/DD")
												: "-"}
											-
											{formDataState.dateToSectionMesh
												? formDataState.dateToSectionMesh.format("YYYY-MM-DD")
												: new Date()
														.toISOString()
														.slice(0, 10)
														.replaceAll("-", "/")}
										</Typo>
										<Typo>:{seaAreaName ?? "-"}</Typo>
										<Typo>: {averageValues.averageWindSpeed}m/s</Typo>
										<Typo>: {averageValues.averageWaveHeight}m</Typo>
										<Typo>: {averageValues.averageVisibility}km</Typo>
									</ResultContainer>
								</>
							)}
						</TopContainer>
					</Contain>

					<DevidedLine bool={false} />

					{formDataState?.dateFromSectionMesh ? (
						<Contain style={{ width: "300px" }}>
							<BarupContainer>
								{chartData.length !== 0 &&
									accidentTypeOptions.map((type) => (
										<Link
											key={type.label}
											onClick={() => handleAccidentTypeSelect(type.value)}
											className={
												selectedAccidentType === type.value ? "active" : ""
											}
										>
											{type.value}
										</Link>
									))}
							</BarupContainer>
							<BarContainer>
								<h2 style={{ marginBottom: "8px" }}>
									当海域における
									{formDataState?.dateFromSectionMesh?.format("YYYY/MM/DD") ||
										"開始日"}
									-
									{formDataState?.dateToSectionMesh?.format("YYYY/MM/DD") ??
										"終了日"}
									での事故件数
								</h2>
								<ResponsiveContainer width="300px" height="100%">
									<BarChart
										data={chartData}
										xValue="name"
										yValues="accidentCount" // Number of accidents on Y-axis
										activeArea={selectedSeaArea}
										onBarClick={handleBarClick}
									/>
								</ResponsiveContainer>
							</BarContainer>
						</Contain>
					) : (
						<Empty
							description="日付を指定すると指定期間内の当海域における事故件数がご覧になれます"
							image={Empty.PRESENTED_IMAGE_DEFAULT}
						/>
					)}
					<DevidedLine bool={false} />

					<Contain style={{ width: "300px" }}>
						{formDataState?.dateFromSectionMesh ? (
							<SeaAreaCharts
								formDataState={formDataState}
								lineChartData={lineChartData}
								graphContent={graphContent}
								setGraphContent={setGraphContent}
							/>
						) : (
							<Empty
								description="日付を指定すると指定期間内における海象推移がご覧になれます"
								image={Empty.PRESENTED_IMAGE_DEFAULT}
							/>
						)}
					</Contain>
					<DevidedLine bool={false} />

					<Contain>
						{filteredAccidents.length > 0 ? (
							<AccidentTable
								accidentColumns={accidentColumns}
								filteredAccidents={filteredAccidents}
							/>
						) : (
							<div className="p-4 text-center">
								この海域における事故情報は見つかりませんでした
							</div>
						)}
					</Contain>
				</>
			)}
			<Modal
				open={isModalVisible} // Updated from 'visible' to 'open'
				onCancel={() => setIsModalVisible(false)}
				footer={null}
				width={600}
			>
				<p>{modalContent}</p>
			</Modal>
		</Contain>
	);
};

const SeaAreaCharts: React.FC<SeaAreaChartsProps> = ({
	formDataState,
	lineChartData,
	graphContent,
	setGraphContent,
}) => {
	return (
		<Flex vertical>
			<Typo>{`海象推移 (${formDataState?.dateFromSectionMesh?.format("YYYY/MM/DD") ?? "YYYY/MM/DD"} - ${formDataState?.dateToSectionMesh?.format("YYYY/MM/DD") ?? "YYYY/MM/DD"})`}</Typo>
			<LineChart
				width={300}
				height={300}
				data={lineChartData}
				margin={{ right: 20, left: 0 }}
				style={{ width: "300px" }}
			>
				<XAxis dataKey="name" />
				<YAxis />
				<Tooltip />
				<Legend verticalAlign="bottom" align="center" />
				<Line
					type="monotone"
					dataKey={
						graphContent === "windSpeedAve"
							? "windSpeed"
							: graphContent === "waveHeightAve"
								? "waveHeight"
								: "visibility"
					}
					stroke="#8884d8"
					dot={false}
				/>
			</LineChart>
			<Flex align="center" justify="center">
				<Select
					defaultValue="windSpeedAve"
					placeholder="日最大風速"
					style={{ width: 150, margin: "10px 0" }}
					value={graphContent}
					onChange={(value) => {
						setGraphContent(value);
					}}
					options={[
						{ value: "windSpeedAve", label: "日最大風速 (m/s)" },
						{ value: "waveHeightAve", label: "日最大波高 (m)" },
						{ value: "visibilityAve", label: "日最低視程 (m)" },
					]}
				/>
			</Flex>
		</Flex>
	);
};
type AccidentTableProps = {
	accidentColumns: ColumnsType<AccidentFeature>; // Table のカラム型
	filteredAccidents: AccidentFeature[];
};

const AccidentTable: React.FC<AccidentTableProps> = ({
	accidentColumns,
	filteredAccidents,
}) => (
	<Table
		columns={accidentColumns}
		dataSource={filteredAccidents.map(
			(accident: AccidentFeature, index: number) => ({
				key: index,
				...accident,
			}),
		)}
		pagination={{
			total: filteredAccidents.length,
			pageSize: 10,
			showSizeChanger: true,
			showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
		}}
		scroll={{ x: "max-content" }}
	/>
);

export default SeaAreaDetail;
