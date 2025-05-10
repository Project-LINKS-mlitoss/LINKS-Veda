import styled from "@emotion/styled";
import { Empty, Flex } from "antd";
import { useCallback, useRef, useState } from "react";
import Icon from "~/components/atoms/Icon";
import Table from "~/components/atoms/Table";

type TableItem = {
	key: number;
	id: number;
	shipName: string;
	departure: string;
	arrival: string;
	operator: string;
	operatorAddress: string;
	hasRoute: boolean;
};
type dataType = Array<{
	[x: string]: string;
}>;

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
	handleRowClick?: (record: dataType) => void;
}

const initialWidth = 300;
const initialHeight = 400;

const TableComponent: React.FC<TableComponentProps> = ({
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
	// vertical resize process
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
		setHeight((prevHeight) => Math.max(initialHeight, prevHeight - deltaY));
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
				maxWidth: "800px",
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
						<StyledTable
							// @ts-ignore
							dataSource={dataList.map((item, index) => ({
								key: index,
								// @ts-ignore
								...item,
							}))}
							rowClassName={(record) =>
								(record as TableItem).key === selectedRowKey
									? "selected-row"
									: ""
							}
							columns={columns}
							pagination={false} // Disable pagination
							scroll={{ y: 400, x: "max-content" }} // Vertical scroll only
							style={{
								width: "100%",
								cursor: "pointer",
							}}
							// onRow={(record: unknown) => ({
							// 	onClick: () => {
							// 		setSelectedRowKey((record as TableItem).key); // Set selected row
							// 		if (handleRowClick) {
							// 			handleRowClick(record as dataType);
							// 		}
							// 	},
							// })}
							onRow={(record: unknown) => ({
								onClick: () => {
									if ((record as TableItem).hasRoute) {
										// Only trigger onClick when hasRoute is true
										setSelectedRowKey((record as TableItem).key);
										if (handleRowClick) {
											handleRowClick(record as dataType);
										}
									}
								},
								style: {
									cursor: (record as TableItem).hasRoute
										? "pointer"
										: "not-allowed",
									opacity: (record as TableItem).hasRoute ? 1 : 0.7,
								},
							})}
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

export default TableComponent;
