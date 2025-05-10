// @ts-nocheck
import { booleanPointInPolygon } from "@turf/turf";
// FIXME: it's only used by UC16, but I think we can delete this file
// @ts-nocheck
import { useMemo, useState } from "react";
import Modal from "~/components/atoms/Modal";
import Table from "~/components/atoms/Table";
import Tooltip from "~/components/atoms/Tooltip";
import Sidebar from "~/components/molecules/Sidebar";
import RouteDetail from "./RouteDetail";
import { KeyValueContainer, KeyValueRow } from "./styled";
import type { PanelProps } from "./types";
import type { UAVPolygon } from "./types";
import { filterPointsInsidePolygon } from "./utils/helperFunctions";

const ItemDetailPanel: React.FC<PanelProps> = ({
	currentItem,
	onShowGraphPanel,
	handleBack,
	features,
	values,
	isTableHide,
	flightPlans,
}) => {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [modalContent, setModalContent] = useState("");

	const polygonGeometry = currentItem?.geometry;

	const filteredPoints = useMemo(() => {
		return polygonGeometry && polygonGeometry?.type === "Polygon"
			? filterPointsInsidePolygon(features, polygonGeometry as UAVPolygon)
			: features;
	}, [features, polygonGeometry]);

	const allKeys = useMemo(() => {
		const keys = new Set<string>();

		for (const feature of filteredPoints) {
			for (const key of Object.keys(feature.properties || {})) {
				keys.add(key);
			}
		}

		return Array.from(keys);
	}, [filteredPoints]);

	const filteredFlightPlans = useMemo(() => {
		if (!!currentItem?._geometry || currentItem?._geometry?.type !== "Polygon")
			return flightPlans;

		return flightPlans.filter((flightPlan) => {
			const point = {
				type: "Point",
				coordinates: [flightPlan.lon, flightPlan.lat],
			};

			return booleanPointInPolygon(point, {
				type: "Polygon",
				coordinates: currentItem._geometry.coordinates,
			});
		});
	}, [flightPlans, currentItem]);
	const columns = useMemo(() => {
		const allKeys = [
			...new Set(
				(filteredFlightPlans || []).flatMap((flightPlan) =>
					flightPlan ? Object.keys(flightPlan) : [],
				),
			),
		];

		return allKeys.map((key) => ({
			title: key,
			dataIndex: key,
			key,
			width: 150,
			ellipsis: true,
			render: (value: string | number | null) =>
				value && typeof value === "string" && value.length > 20 ? (
					<Tooltip title={value}>
						<button
							style={{
								cursor: "pointer",
								textDecoration: "underline",
								color: "blue",
							}}
							type="button"
							onClick={() => handleTextExpand(value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									handleTextExpand(value);
								}
							}}
							tabIndex={0}
						>
							{value.slice(0, 20)}...
						</button>
					</Tooltip>
				) : (
					value ?? "未定義"
				),
		}));
	}, [filteredFlightPlans]);
	const tableData = useMemo(() => {
		return (filteredFlightPlans || []).map((flightPlan, index) => {
			const rowData: Record<string, string | number | null> = { key: index };

			for (const [key, value] of Object.entries(flightPlan)) {
				if (typeof value === "object" && value !== null) {
					rowData[key] = JSON.stringify(value);
				} else if (
					typeof value === "string" ||
					typeof value === "number" ||
					value === null
				) {
					rowData[key] = value;
				} else {
					rowData[key] = "N/A";
				}
			}

			return rowData;
		});
	}, [filteredFlightPlans]);

	const handleTextExpand = (text: string) => {
		setModalContent(text);
		setIsModalVisible(true);
	};

	const renderKeyValuePairs = () => {
		if (!currentItem?.properties) return null; // Handle cases where currentItem or properties are undefined

		return Object.entries(currentItem.properties).map(([key, value]) => (
			<KeyValueRow key={key}>
				<div
					className="text-xs max-w-[70%] break-words pr-5"
					style={{
						wordWrap: "break-word",
						overflowWrap: "break-word",
						whiteSpace: "normal", // Ensure wrapping is applied
					}}
				>
					{key}
				</div>
				<div className="max-w-[70%] text-xs">
					{typeof value === "string" ? (
						<Tooltip placement="topLeft" title={value}>
							<button
								style={{ cursor: "pointer", color: "black" }}
								onClick={() => handleTextExpand(value)}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										handleTextExpand(value); // Trigger on Enter or Space key
									}
								}}
								type="button"
								tabIndex={0} // Makes the span focusable
							>
								{value !== null && value !== undefined ? String(value) : "N/A"}
							</button>
						</Tooltip>
					) : (
						<span>
							{value !== null && value !== undefined ? String(value) : "N/A"}
						</span>
					)}
				</div>
			</KeyValueRow>
		));
	};
	return (
		<Sidebar
			title={
				currentItem?.source.startsWith("flightPlans-")
					? "飛行計画詳細"
					: currentItem?.geometry?.type === "MultiLineString"
						? "AIS航跡情報詳細"
						: "事故情報詳細"
			}
			initialWidth={500}
			onBackClick={handleBack}
		>
			<div className="flex flex-col p-4">
				<KeyValueContainer>{renderKeyValuePairs()}</KeyValueContainer>
				{!isTableHide && (
					<>
						<span style={{ marginBottom: "8px", fontWeight: "bold" }}>
							期間内事故一覧
						</span>
						<Table
							dataSource={tableData}
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
							scroll={{ x: true }}
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
					</>
				)}
			</div>

			{/* Modal for long text */}
			<Modal
				open={isModalVisible} // Updated from 'visible' to 'open'
				onCancel={() => setIsModalVisible(false)}
				footer={null}
				width={600}
			>
				<p>{modalContent}</p>
			</Modal>
		</Sidebar>
	);
};

export default ItemDetailPanel;
