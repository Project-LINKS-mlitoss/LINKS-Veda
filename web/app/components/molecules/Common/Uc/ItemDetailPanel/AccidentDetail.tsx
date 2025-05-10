import { useState } from "react";
import Modal from "~/components/atoms/Modal";
import Table from "~/components/atoms/Table";
import Tooltip from "~/components/atoms/Tooltip";
import Sidebar from "~/components/molecules/Sidebar";
import { KeyValueContainer, KeyValueRow } from "./styled";
import type { PanelProps } from "./types";
import { generateJtsbUrl } from "./utils/generateJtsbUrl";

const AccidentDetail: React.FC<PanelProps> = ({
	currentItem,
	onShowGraphPanel,
	handleBack,
	fieldObjects,
	values,
}) => {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [modalContent, setModalContent] = useState("");

	const allKeys = Array.from(
		fieldObjects.reduce<Set<string>>((keys, item) => {
			for (const field of item.fields) {
				keys.add(field.key);
			}
			return keys;
		}, new Set<string>()),
	);

	const columns = allKeys.map((key) => ({
		title: key,
		dataIndex: key,
		key,
		width: 150,
		ellipsis: true,
		render: (value: string | number | null) => {
			const url = key.includes("ファイル名")
				? generateJtsbUrl(String(value))
				: null;
			if (url) {
				return (
					<Tooltip title={value}>
						<a
							href={url}
							target="_blank"
							rel="noopener noreferrer"
							style={{ color: "blue", textDecoration: "underline" }}
						>
							{value}
						</a>
					</Tooltip>
				);
			}

			return value && typeof value === "string" && value.length > 20 ? (
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
								handleTextExpand(value); // Trigger the same action as onClick
							}
						}}
						tabIndex={0} // Make the span focusable with the keyboard
					>
						{value.slice(0, 20)}... {/* Display only the first 20 characters */}
					</button>
				</Tooltip>
			) : (
				value ?? "未定義" // Fallback for undefined or null values
			);
		},
	}));

	const tableData = fieldObjects.map((item) => {
		const rowData: Record<string, string | number | null | JSX.Element> = {
			key: item.id,
		};
		for (const field of item.fields) {
			rowData[field.key] = field.value ?? "N/A"; // デフォルト値
		}
		// Ensure all keys exist in the row data
		for (const key of allKeys) {
			if (!(key in rowData)) {
				rowData[key] = "N/A"; // Add missing keys with default value
			}
		}
		return rowData;
	});

	const handleTextExpand = (text: string) => {
		setModalContent(text);
		setIsModalVisible(true);
	};

	const renderKeyValuePairs = () => {
		if (!currentItem?.properties) return null; // Handle cases where currentItem or properties are undefined

		return Object.entries(currentItem.properties).map(([key, value]) => {
			const modifiedValue =
				value !== null && value !== undefined ? String(value) : "N/A";
			const url = key.includes("ファイル名")
				? generateJtsbUrl(modifiedValue)
				: null;
			return (
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
						{typeof modifiedValue === "string" ? (
							<Tooltip placement="topLeft" title={modifiedValue}>
								<button
									style={{ cursor: "pointer", color: "black" }}
									onClick={() => handleTextExpand(modifiedValue)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											handleTextExpand(modifiedValue); // Trigger on Enter or Space key
										}
									}}
									type="button"
									tabIndex={0} // Makes the span focusable
								>
									{url ? (
										<a href={url} target="blank">
											{modifiedValue}
										</a>
									) : (
										modifiedValue
									)}
								</button>
							</Tooltip>
						) : (
							<span>{modifiedValue}</span>
						)}
					</div>
				</KeyValueRow>
			);
		});
	};
	return (
		<Sidebar
			title={
				currentItem.geometry.type === "MultiLineString"
					? "AIS航跡情報詳細"
					: "事故情報詳細"
			}
			initialWidth={500}
			onBackClick={handleBack}
		>
			<div className="flex flex-col p-4">
				<KeyValueContainer>{renderKeyValuePairs()}</KeyValueContainer>
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

export default AccidentDetail;
