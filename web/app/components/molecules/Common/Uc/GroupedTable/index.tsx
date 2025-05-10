//@ts-nocheck
import styled from "@emotion/styled";
import type { TableColumnsType } from "antd";
import { Badge, Dropdown, Empty, Flex, Space, Table } from "antd";
import type React from "react";
import { useCallback, useRef, useState } from "react";
import Icon from "~/components/atoms/Icon";

interface TableComponentProps {
	columns?: {
		title: string;
		dataIndex: string;
		key: string;
		width?: number;
	}[];
	isCollapsed?: boolean;
	icon?: string;
	title?: string;
	toggleCollapse?: () => void;
	// @ts-ignore
	dataList?: never[];
	handleRowClick?: (record: GroupedOperatorData) => void;
}
interface ShipData {
	id: number;
	shipName: string;
	MMSI番号: string;
	arrival: string;
	departure: string;
	hasRoute: boolean;
	operator: string;
	operatorAddress: string;
	seaArea: string;
}

interface GroupedOperatorData {
	key: string;
	operator: string;
	operatorAddress: string;
	seaArea: string;
	children: Array<{
		key: string;
		id: string;
		shipName: string;
		MMSI番号: string;
		arrival: string;
		departure: string;
		hasRoute: string;
	}>;
}

const initialWidth = 300;
const initialHeight = 400;

const expandDataSource = Array.from({ length: 3 }).map((_, i) => ({
	key: i.toString(),
	date: "2014-12-24 23:12:00",
	name: "This is production name",
	upgradeNum: "Upgraded: 56",
}));

const expandColumns: TableColumnsType = [
	{
		title: "AIS航跡",
		dataIndex: "hasRoute",
		key: "hasRoute",
		render: (value: boolean) => (value ? "✔" : "✖"),
	},
	{ title: "ID", dataIndex: "id", key: "id" },
	{
		title: "船名",
		dataIndex: "shipName",
		key: "shipName",
		filterMode: "tree",
		filterSearch: true,
		onFilter: (value, record) => record.name.includes(value as string),
	},

	{ title: "MMSI番号", dataIndex: "MMSI番号", key: "MMSI番号" },
	{ title: "起点 港名", dataIndex: "departure", key: "departure" },
	{ title: "終点 港名", dataIndex: "arrival", key: "arrival" },
];

const GroupedTable: React.FC<TableComponentProps> = ({
	isCollapsed,
	icon,
	title,
	toggleCollapse,
	dataList,
	columns,
	handleRowClick,
}) => {
	const [selectedRowKey, setSelectedRowKey] = useState<number | null>(null); // Store selected row key
	const isDraggingRef = useRef(false);
	const dragStartPosRef = useRef({ x: 0, y: 0 });
	const [height, setHeight] = useState(initialWidth);
	const [width, setWidth] = useState(initialHeight);
	const groupByOperator = (data: ShipData[]) => {
		const groupedData: Record<string, ShipData[]> = {};

		for (const item of data) {
			if (!groupedData[item.operator]) {
				groupedData[item.operator] = [];
			}
			groupedData[item.operator].push(item);
		}

		return Object.entries(groupedData).map(([operator, data], index) => ({
			key: `op-${index}`,
			operator,
			operatorAddress: data[0].operatorAddress,
			seaArea: data[0].seaArea,
			companySection: data[0].companySection,
			capital: data[0].capital,
			ceoName: data[0].ceoName,
			employeeCount: data[0].employeeCount,
			phoneNumber: data[0].phoneNumber,
			children: data.map((item) => ({
				key: `${item.id}`,
				id: `${item.id}`,
				shipName: item.shipName,
				MMSI番号: item.MMSI番号,
				arrival: item.arrival,
				departure: item.departure,
				hasRoute: item.hasRoute === true,
				meshIds: item.meshIds,
			})),
		}));
	};
	// vertical resize process
	const expandedRowRender = (record: GroupedOperatorData) => (
		<Table
			columns={expandColumns}
			dataSource={record.children}
			pagination={false}
			// scroll={{ x: 1000, y: 1000 }}
			virtual
			onRow={(record) => ({
				onClick: () => {
					setSelectedRowKey(record.key); // Highlight selected row
					handleRowClick?.(record); // Send row data back
				},
				style: {
					cursor: "pointer",
					opacity: record.hasRoute ? 1 : 0.6, // Lower opacity for other than route included rows
				},
			})}
		/>
	);
	const handleTopResizeStart = useCallback((e: React.MouseEvent) => {
		isDraggingRef.current = true;
		dragStartPosRef.current = { x: e.clientX, y: e.clientY };
		e.preventDefault();
		document.addEventListener("mousemove", handleTopResize);
		document.addEventListener("mouseup", handleResizeEnd);
	}, []);
	const handleTopResize = useCallback((e: MouseEvent) => {
		if (!isDraggingRef.current) return;
		const deltaY = e.clientY - dragStartPosRef.current.y;
		const mapHeight =
			document.getElementsByClassName("maplibregl-canvas")[0].clientHeight;

		setHeight((prevHeight) =>
			Math.min(Math.max(initialHeight, prevHeight - deltaY), mapHeight - 100),
		);
		dragStartPosRef.current.y = e.clientY;
	}, []);
	const handleLeftResizeStart = useCallback((e: React.MouseEvent) => {
		isDraggingRef.current = true;
		dragStartPosRef.current = { x: e.clientX, y: e.clientY };
		e.preventDefault();
		document.addEventListener("mousemove", handleLeftResize);
		document.addEventListener("mouseup", handleResizeEnd);
	}, []);

	const handleLeftResize = useCallback((e: MouseEvent) => {
		if (!isDraggingRef.current) return;
		const deltaX = e.clientX - dragStartPosRef.current.x;
		setWidth((prevWidth) => Math.max(initialWidth, prevWidth - deltaX));
		dragStartPosRef.current.x = e.clientX;
	}, []);

	const handleResizeEnd = useCallback(() => {
		isDraggingRef.current = false;
		document.removeEventListener("mousemove", handleTopResize);
		document.removeEventListener("mousemove", handleLeftResize);
		document.removeEventListener("mouseup", handleResizeEnd);
	}, [handleTopResize, handleLeftResize]);
	return (
		<div
			style={{
				overflow: "auto",
				width: isCollapsed ? "auto" : `${width}px`,
				height: isCollapsed ? "auto" : `${height}px`,
				display: "flex",
				flexDirection: "column",
				overflowY: "hidden",
			}}
		>
			{!isCollapsed && (
				<>
					<div
						onMouseDown={handleTopResizeStart}
						style={{ minHeight: "5px", cursor: "ns-resize" }}
					/>
					<div
						onMouseDown={handleLeftResizeStart}
						style={{
							width: "5px",
							height: "100%",
							cursor: "ew-resize",
							position: "absolute",
							zIndex: 2,
							top: 0,
							left: 0,
						}}
					/>
				</>
			)}

			{/* Header with Collapse Button */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					padding: "10px 14px",
					background: "#f5f5f5",
					cursor: "pointer",
				}}
				onClick={toggleCollapse}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault(); // Prevent scrolling for space key
						toggleCollapse?.();
					}
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
					<Icon icon={icon} size={16} />
					{!isCollapsed && <span>{title}</span>}
				</div>
				{!isCollapsed && (
					<Icon
						icon="shrinkOutlined"
						size={16}
						className="transition-transform"
					/>
				)}
			</div>

			{/* Table Content */}
			{!isCollapsed && (
				<div style={{ background: "#fff", height: `${height}px` }}>
					{dataList?.length === 0 ? (
						<Flex justify="center" align="center">
							<Empty
								description="利用可能なデータがありません"
								image={Empty.PRESENTED_IMAGE_SIMPLE}
							/>
						</Flex>
					) : (
						<Table
							columns={columns}
							expandable={{
								expandedRowRender,
								defaultExpandedRowKeys: ["0"],
							}}
							pagination={false}
							scroll={{ x: 1000, y: "true" }}
							virtual
							// @ts-ignore
							dataSource={groupByOperator(dataList)}
							size="middle"
						/>
					)}
				</div>
			)}
		</div>
	);
};
const StyledTable = styled(Table)`
	.ant-table {
		border-radius: 0;
	}
	.selected-row {
		background-color:#E6F7FF !important;
		color: #1890FF;
	}
`;

export default GroupedTable;
