import { Divider, Flex, Typography } from "antd";
const { Text } = Typography;
import { useMemo, useState } from "react";
import { Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import Select from "~/components/atoms/Select";
import Table from "~/components/atoms/Table";
import TrafficChart from "./TrafficChart";
import { useAccidentData } from "./hooks/useAccidentData";
import { useAverageValues } from "./hooks/useAverageValues";
import { useGraphData } from "./hooks/useGraphData";
import { useTrafficData } from "./hooks/useTrafficVolumeData";
import type { MeshDetailProps } from "./types";
import { getGraphContentLabel } from "./utils/graphUtils";

const MeshDetail: React.FC<MeshDetailProps> = ({
	currentItem,
	values,
	fieldObjects,
	handleTextExpand,
	selectedMesh,
	accidents,
	filteredMeshes,
}) => {
	const [graphContent, setGraphContent] = useState<string>("windSpeedAve");
	const startDate = values?.dateFromSectionMesh?.format("YYYY-MM-DD") ?? "";
	const endDate = values?.dateToSectionMesh?.format("YYYY-MM-DD") ?? "";
	const trafficData = useTrafficData(
		startDate,
		endDate,
		selectedMesh?.properties.mesh_id ?? "",
	);
	const meshDatas = filteredMeshes?.filter(
		(mesh) =>
			selectedMesh?.properties.mesh_id &&
			mesh.properties.mesh_id === selectedMesh?.properties.mesh_id,
	);
	const graphData = useGraphData(startDate, endDate, meshDatas);
	const filteredAccidents = useAccidentData(accidents, selectedMesh);
	const averageValues = useAverageValues(meshDatas);
	// Data to be fed to the table at the bottom
	const accidentTableData = useMemo(() => {
		return filteredAccidents.map((accident, index) => ({
			key: index,
			...accident.properties,
		}));
	}, [filteredAccidents]);

	const accidentColumns = useMemo(() => {
		if (filteredAccidents.length === 0) {
			return [
				{
					title: "No Data",
					dataIndex: "noData",
					key: "noData",
					render: () => "不明",
				},
			];
		}

		// Collect all unique keys from properties
		const uniqueKeys = new Set<string>();
		for (const accident of filteredAccidents) {
			if (accident.properties) {
				for (const key of Object.keys(accident.properties)) {
					uniqueKeys.add(key);
				}
			}
		}

		// Create column configuration for each unique key
		return Array.from(uniqueKeys).map((key) => ({
			title: key,
			dataIndex: key,
			key,
			render: (value: string | number | null) => value ?? "未定義", // Display "未定義" if the value is null/undefined
		}));
	}, [filteredAccidents]);

	return (
		<Flex vertical style={{ width: "100%", padding: "0 20px" }}>
			<Flex
				vertical
				style={{
					width: "100%",
					margin: "20px 0",
				}}
			>
				<Flex>
					<span style={{ width: "50%", padding: "4px 0" }}>メッシュID</span>
					<span style={{ width: "50%", padding: "4px 0" }}>
						{selectedMesh?.properties.mesh_id}
					</span>
				</Flex>
				<Flex>
					<span style={{ width: "50%", padding: "4px 0" }}>対象期間</span>
					<span
						style={{ width: "50%", padding: "4px 0" }}
					>{`${values?.dateFromSectionMesh?.format("YYYY/MM/DD") ?? "YYYY/MM/DD"}-${values?.dateToSectionMesh?.format("YYYY/MM/DD") ?? "YYYY/MM/DD"}`}</span>
				</Flex>
				<Flex>
					<span style={{ width: "50%", padding: "4px 0" }}>平均視程</span>
					<span style={{ width: "50%", padding: "4px 0" }}>
						{averageValues.averageVisibility === 0
							? "-"
							: averageValues.averageVisibility}
					</span>
				</Flex>
				<Flex>
					<span style={{ width: "50%", padding: "4px 0" }}>平均波高</span>

					<span style={{ width: "50%", padding: "4px 0" }}>
						{averageValues.averageWaveHeight === 0
							? "-"
							: averageValues.averageWaveHeight}
					</span>
				</Flex>
				<Flex>
					<span style={{ width: "50%", padding: "4px 0" }}>平均風速</span>
					<span style={{ width: "50%", padding: "4px 0" }}>
						{averageValues.averageWindSpeed === 0
							? "-"
							: averageValues.averageWindSpeed}
					</span>
				</Flex>
			</Flex>
			<Flex wrap style={{ width: "100%", margin: "20px 0" }}>
				<Text>{`交通量の変化 (${values?.dateFromSectionMesh?.format("YYYY/MM/DD") ?? "YYYY/MM/DD"} - ${values?.dateToSectionMesh?.format("YYYY/MM/DD") ?? "YYYY/MM/DD"})`}</Text>
				<TrafficChart trafficData={trafficData} />
			</Flex>

			<Flex wrap style={{ width: "100%", margin: "10px 0" }}>
				<Text>{`当区画の${values?.dateFromSectionMesh?.format("YYYY/MM/DD") ?? "YYYY/MM/DD"}-${values?.dateToSectionMesh?.format("YYYY/MM/DD") ?? "YYYY/MM/DD"}における\n`}</Text>
				<Text>{getGraphContentLabel(graphContent)}の推移</Text>
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
			</Flex>
			<Flex align="center" justify="center">
				<Select
					defaultValue={graphContent}
					placeholder="最大風速"
					style={{ width: 120 }}
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
			<Flex wrap style={{ marginBottom: "10px" }}>
				<Text>{`当区画の${values?.dateFromSectionMesh?.format("YYYY/MM/DD") ?? "YYYY/MM/DD"}-${values?.dateToSectionMesh?.format("YYYY/MM/DD") ?? "YYYY/MM/DD"}における`}</Text>
				<Text>事故一覧</Text>
			</Flex>
			<Table
				dataSource={accidentTableData}
				columns={accidentColumns}
				size="small"
				pagination={{
					defaultPageSize: 20,
					total: accidentTableData.length,
					showSizeChanger: true,
					pageSizeOptions: [10, 25, 50, 100],
					showTotal: (total, range) =>
						`${range[0]}-${range[1]} of ${total} items`,
				}}
				rowClassName={() => "clickable-row"}
				scroll={{ x: "max-content" }}
				// FIX/TASK this commented out part could later be used to select rows for various purposes
				// onRow={(record) => ({
				// 	onClick: () => {
				// 		const transformedItem: SeaAccidentFeature = {
				// 			type: "Feature", // Assuming all items are GeoJSON features
				// 			geometry: currentItem.geometry, // Retain the geometry from the currentItem
				// 			properties: {
				// 				...currentItem.properties, // Use the existing properties as a base
				// 				...record, // Merge the clicked record to override fields
				// 			},
				// 		};
				// 		setSelectedItem(transformedItem);
				// 	},
				// })}
			/>
		</Flex>
	);
};

export default MeshDetail;
