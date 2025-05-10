import { Button, Divider, Flex, Space, Typography } from "antd";
const { Text } = Typography;
import { CaretRightOutlined } from "@ant-design/icons";
import { useCallback, useMemo, useState } from "react";
import {
	Legend,
	Line,
	LineChart,
	ReferenceLine,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import Collapse from "~/components/atoms/Collapse";
import Modal from "~/components/atoms/Modal";
import Select from "~/components/atoms/Select";
import Table from "~/components/atoms/Table";
import BaseToolTip from "~/components/atoms/Tooltip";
import CollapsableSectionTitle from "~/components/molecules/Common/Uc/CollapsableSectionTitle";
import { useFilteredRoutePoints } from "./hooks/useFilteredRoutePoints";
import { useGraphData } from "./hooks/useGraphData";
import type { RouteDetailProps } from "./types";
import {
	getGraphContentLabel,
	getRefBeforeData,
	getRefDuringData,
} from "./utils/graphUtils";

const RouteDetail: React.FC<RouteDetailProps> = ({
	currentItem,
	values,
	fieldObjects,
	handleTextExpand,
	filteredMeshes,
	selectedTableRow,
	generalCsvData,
}) => {
	const [graphContent, setGraphContent] = useState<string>("windSpeedAve");
	const startDate = values?.dateFromSectionMesh?.format("YYYY-MM-DD") ?? "";
	const endDate = values?.dateToSectionMesh?.format("YYYY-MM-DD") ?? "";
	const hasRoute = currentItem?.hasRoute ?? false;

	// get ship info
	const shipName =
		currentItem?.properties?.船名 ?? currentItem?.shipName ?? "不明";
	const mmsiNumber =
		currentItem?.properties?.MMSI番号?.toString() ??
		currentItem?.MMSI番号?.toString() ??
		"不明";
	// const operator =
	// 	currentItem?.properties["氏名（企業名）"] ??
	// 	currentItem?.operator?.toString() ??
	// 	"不明";
	// const departure = // @ts-ignore
	// 	currentItem?.properties?.routeData?.tableData?.[0]?.from ??
	// 	currentItem?.departure ??
	// 	"不明";
	// const arrival =
	// 	// @ts-ignore
	// 	currentItem?.properties?.routeData?.tableData?.[0]?.to ??
	// 	currentItem?.arrival ??
	// 	"不明";
	const [isDetailExpanded, setIsDetailExpanded] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [modalContent, setModalContent] = useState("");
	const filteredRoutePoints = useFilteredRoutePoints(shipName, currentItem);

	const allKeys = Array.from(
		fieldObjects.reduce<Set<string>>((keys, item) => {
			for (const field of item.fields) {
				keys.add(field.key);
			}
			return keys;
		}, new Set<string>()),
	);

	const tableData = fieldObjects.length
		? fieldObjects.map((item) => {
				const rowData: Record<string, string | number | null> = {
					key: item.id,
				};
				for (const field of item.fields) {
					rowData[field.key] = field.value ?? "不明"; // Default to "N/A" if the value is null/undefined
				}
				// Ensure all keys exist in the row data
				for (const key of allKeys) {
					if (!(key in rowData)) {
						rowData[key] = "不明";
					}
				}
				return rowData;
			})
		: [
				{
					key: "empty",
					...Object.fromEntries(allKeys.map((key) => [key, "不明"])),
				},
			];
	const currentData = useMemo(() => {
		return generalCsvData.filter((data) => {
			let flag = false;
			Object.keys(data).map((key) => {
				if (data[key] === shipName) flag = true;
			});
			return flag;
		});
	}, [generalCsvData, shipName]);
	const handleItemTextExpand = (text: string) => {
		setModalContent(text);
		setIsModalVisible(true);
	};
	const isIncludes = useCallback(
		(arr, target: string) => arr.some((el: string) => target.includes(el)),
		[],
	);

	const visibleLimit = 4; // 最初に表示する数
	const renderKeyValuePairs = () => {
		if (!currentData.length) return null; // Handle cases where currentItem or properties are undefined

		const keyValuePairs = Object.entries(currentData[0]).filter(
			([key, value]) =>
				value &&
				!isIncludes(
					["_2", "_3", "_4", "_5", "_6", "_7", "_8", "_9", "_10"],
					key,
				),
		);
		const visibleItems = isDetailExpanded
			? keyValuePairs
			: keyValuePairs.slice(0, visibleLimit);

		return (
			<>
				{visibleItems.map(([key, value]) => (
					<Flex key={key}>
						<span style={{ width: "50%", padding: "4px 0" }}>{key}</span>
						<span style={{ width: "50%", padding: "4px 0" }}>{value}</span>
					</Flex>
				))}

				{/* 「もっと見る / 詳細を閉じる」ボタン */}
				{keyValuePairs.length > visibleLimit && (
					<Button
						type="default"
						onClick={() => setIsDetailExpanded(!isDetailExpanded)}
						style={{
							marginTop: "8px",
							padding: "6px 12px",
						}}
					>
						{isDetailExpanded ? "詳細を閉じる" : "もっと見る"}
					</Button>
				)}
			</>
		);
	};
	const columns = useMemo(() => {
		if (!filteredRoutePoints.length) {
			return [
				{
					title: "No Data",
					dataIndex: "key",
					key: "no-data",
					render: () => "不明",
				},
			];
		}

		const firstItemProps = filteredRoutePoints[0].properties;
		return Object.keys(firstItemProps).map((key) => ({
			title: key,
			dataIndex: key,
			key,
		}));
	}, [filteredRoutePoints]);
	// getting array of mesh ids
	const selectedMeshIds = useMemo(() => {
		const meshList =
			currentItem?.properties?.メッシュIDリスト ?? currentItem?.meshIds;
		if (!meshList) return [];
		if (typeof meshList === "string") {
			return meshList.split(",").map((id: string) => id.trim());
		}
		return Array.isArray(meshList) ? meshList : [];
	}, [currentItem]);

	const graphData = useGraphData(
		startDate,
		endDate,
		filteredMeshes,
		selectedMeshIds,
	);
	// non route holder ships general CSV
	const matchingGeneralCsvItem = useMemo(() => {
		if (!selectedTableRow?.shipName || !Array.isArray(generalCsvData))
			return null;
		return generalCsvData.find(
			(item) => item.船名_1?.trim() === selectedTableRow.shipName.trim(),
		);
	}, [selectedTableRow, generalCsvData]);
	// Filter out empty key-value pairs
	const filteredGeneralCsvDetails = useMemo(() => {
		if (!matchingGeneralCsvItem) return [];
		return Object.entries(matchingGeneralCsvItem)
			.filter(
				([key, value]) =>
					value !== null &&
					value !== "" &&
					value !== undefined &&
					!isIncludes(
						["_2", "_3", "_4", "_5", "_6", "_7", "_8", "_9", "_10"],
						key,
					),
			) // Remove empty values
			.map(([key, value]) => ({ key, value: String(value) })); // Convert values to strings
	}, [matchingGeneralCsvItem, isIncludes]);

	return (
		<Flex vertical style={{ width: "100%", padding: "0 20px" }}>
			{hasRoute ? (
				<Flex vertical>
					<Flex
						vertical
						style={{
							width: "100%",
							margin: "20px 0",
						}}
					>
						<Flex>
							<span style={{ width: "50%", padding: "4px 0" }}>MMSI番号</span>
							<span style={{ width: "50%", padding: "4px 0" }}>
								{mmsiNumber}
							</span>
						</Flex>
						<Flex>
							<span style={{ width: "50%", padding: "4px 0" }}>船名</span>
							<span style={{ width: "50%", padding: "4px 0" }}>{shipName}</span>
						</Flex>
						{renderKeyValuePairs()}
					</Flex>
					<div style={{ width: "100%", margin: "20px 0" }}>
						<Text>
							{`当AIS航跡の${values?.dateFromSectionMesh?.format("YYYY/MM/DD") ?? "YYYY/MM/DD"}-${values?.dateToSectionMesh?.format("YYYY/MM/DD") ?? "YYYY/MM/DD"}における\n${getGraphContentLabel(graphContent)}`}
							の推移
						</Text>
						<LineChart
							width={400}
							height={300}
							data={graphData}
							margin={{ right: 10, left: 0 }}
							style={{ width: "100%" }}
						>
							<XAxis dataKey="name" />
							<YAxis />
							<Tooltip />
							<Legend />
							<ReferenceLine
								y={getRefBeforeData(graphContent, currentData[0]) || null}
								label="渡航前発航中止基準"
								stroke="red"
								strokeDasharray="3 3"
							/>
							<ReferenceLine
								y={getRefDuringData(graphContent, currentData[0]) || null}
								label="渡航中発航中止基準"
								stroke="red"
								strokeDasharray="3 3"
							/>
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
								defaultValue={graphContent}
								placeholder="最大風速"
								style={{ width: 150 }}
								value={graphContent}
								onChange={(value) => {
									setGraphContent(value);
								}}
								options={[
									{ value: "windSpeedAve", label: "最大風速" },
									{ value: "waveHeightAve", label: "最大波高" },
									{ value: "visibilityAve", label: "最低視程" },
								]}
							/>
						</Flex>
						<Divider />
						<Space align="center" style={{ marginBottom: "10px" }}>
							<Text>{`${currentItem?.properties?.船名 || currentItem?.shipName}　の過去運行実績一覧`}</Text>
						</Space>

						<Table
							dataSource={filteredRoutePoints.map((item, index) => ({
								key: index,
								...item.properties,
							}))}
							columns={columns}
							size="small"
							pagination={{
								defaultPageSize: 20,
								total: tableData.length,
								showSizeChanger: true,
								pageSizeOptions: [10, 25, 50, 100],
								showTotal: (total, range) =>
									`${range[0]}-${range[1]} of ${total} items`,
							}}
							rowClassName={() => "clickable-row"}
							scroll={{ x: "max-content" }}
						/>
					</div>
				</Flex>
			) : (
				<Flex vertical style={{ width: "100%", padding: "10px" }}>
					{filteredGeneralCsvDetails.length > 0 ? (
						filteredGeneralCsvDetails.map(({ key, value }) => (
							<Flex key={key} justify="space-between">
								<Text>{key}</Text>
								<Text>{value}</Text>
							</Flex>
						))
					) : (
						<Text>データが見つかりません。</Text>
					)}
				</Flex>
			)}
		</Flex>
	);
};

export default RouteDetail;
