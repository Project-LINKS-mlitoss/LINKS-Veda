import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "~/components/atoms/Icon";
import {
	CollapseButton,
	CollapsedIndicator,
	CollapsibleContainer,
	ContentWrapper,
} from "./style";

export interface CollapsibleWrapperProps {
	children: React.ReactNode;
	title: string;
	icon: string;
	side: "left" | "right";
	chartCount?: number;
	isCollapsed?: boolean;
	onCollapsedChange?: (collapsed: boolean) => void;
	isCollapsibleOpen?: boolean;
	setIsCollapsibleOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const CollapsibleWrapper: React.FC<CollapsibleWrapperProps> = ({
	children,
	title,
	icon,
	side,
	chartCount = 0,
	isCollapsed: controlledCollapsed,
	onCollapsedChange,
	isCollapsibleOpen,
	setIsCollapsibleOpen,
}) => {
	// Initialize internalCollapsed based on controlledCollapsed or isCollapsibleOpen
	const [internalCollapsed, setInternalCollapsed] = useState(() => {
		if (controlledCollapsed !== undefined) {
			return controlledCollapsed;
		}
		return !isCollapsibleOpen;
	});
	const isCollapsed = controlledCollapsed ?? internalCollapsed;
	const [width, setWidth] = useState(600);
	const [height, setHeight] = useState(400);
	const [position, setPosition] = useState({ x: 0, y: 0 }); // Default position
	const [dragging, setDragging] = useState(false);
	const [resizeDirection, setResizeDirection] = useState<string | null>(null);
	const sidebarRef = useRef<HTMLDivElement>(null);

	const isDraggingRef = useRef(false);
	const draggingSideRef = useRef<"top" | "left">("top");
	const isResizingRef = useRef(false);

	const dragStartPosRef = useRef({ x: 0, y: 0 });

	useEffect(() => {
		if (isCollapsibleOpen !== undefined && controlledCollapsed === undefined) {
			setInternalCollapsed(!isCollapsibleOpen);
		}
	}, [isCollapsibleOpen, controlledCollapsed]);

	const handleCollapsedChange = useCallback(
		(newCollapsed: boolean) => {
			if (newCollapsed) {
				setIsCollapsibleOpen?.(false);
			}
			if (controlledCollapsed === undefined) {
				setInternalCollapsed(newCollapsed);
			}
			onCollapsedChange?.(newCollapsed);
		},
		[controlledCollapsed, onCollapsedChange, setIsCollapsibleOpen],
	);

	// Handle drag functionality
	const handleDragStart = useCallback(
		(e: React.MouseEvent, side: "top" | "left") => {
			if (e.target !== e.currentTarget || isCollapsed) return;
			isDraggingRef.current = true;
			dragStartPosRef.current = {
				x: e.clientX - position.x,
				y: e.clientY - position.y,
			};
			e.preventDefault();
			document.addEventListener("mousemove", handleDrag);
			document.addEventListener("mouseup", handleDragEnd);

			draggingSideRef.current = side;
		},
		[position, isCollapsed],
	);

	const handleDrag = useCallback(
		(e: MouseEvent) => {
			if (!isDraggingRef.current || !sidebarRef.current) return;
			if (draggingSideRef.current === "top") {
				const newY = e.clientY - dragStartPosRef.current.y;
				const mapHeight =
					document.getElementsByClassName("maplibregl-canvas")[0].clientHeight;
				if (mapHeight - 100 < 300 - newY) return;
				setPosition({
					x: position.x,
					y: newY,
				});
				setHeight(400 - newY);
			} else if (draggingSideRef.current === "left") {
				const newX = e.clientX - dragStartPosRef.current.x;
				setPosition({
					x: newX,
					y: position.y,
				});
				setWidth(600 - newX); // Adjust width as sidebar moves left
			}
		},
		[position],
	);

	const handleDragEnd = useCallback(() => {
		isDraggingRef.current = false;
		document.removeEventListener("mousemove", handleDrag);
		document.removeEventListener("mouseup", handleDragEnd);
	}, [handleDrag]);

	// const handleResizeStart = useCallback((e: React.MouseEvent) => {
	// 	e.preventDefault();
	// 	isResizingRef.current = true;
	// 	document.addEventListener("mousemove", handleResize);
	// 	document.addEventListener("mouseup", handleResizeEnd);
	// }, []);

	// const handleResize = useCallback((e: MouseEvent) => {
	// 	if (!sidebarRef.current || !isResizingRef.current) return;
	// 	const newWidth =
	// 		e.clientX - sidebarRef.current.getBoundingClientRect().left;
	// 	const newHeight =
	// 		e.clientY - sidebarRef.current.getBoundingClientRect().top;
	// 	setWidth(Math.min(Math.max(newWidth, 300), 1024));
	// 	setHeight(Math.min(Math.max(newHeight, 400), 1024));
	// }, []);

	// const handleResizeEnd = useCallback(() => {
	// 	isResizingRef.current = false;
	// 	document.removeEventListener("mousemove", handleResize);
	// 	document.removeEventListener("mouseup", handleResizeEnd);
	// }, [handleResize]);

	return (
		<CollapsibleContainer isCollapsed={isCollapsed} side={side}>
			<CollapseButton
				onClick={() => handleCollapsedChange(!isCollapsed)}
				side={side}
				isCollapsed={isCollapsed}
			/>

			<CollapsedIndicator isCollapsed={isCollapsed}>
				<div className="icon-wrapper">
					<Icon icon={icon} size={20} />
				</div>
				<div className="text-wrapper">{title}</div>
			</CollapsedIndicator>

			<ContentWrapper isCollapsed={isCollapsed}>
				<div
					style={{
						position: "absolute",
						left: `${position.x}px`,
						top: `${position.y}px`,
						width: `${width}px`,
						height: `${height}px`,
						zIndex: 10,
						border: "1px solid #ddd", // Optional: Border for clarity
						background: "white",
					}}
					ref={sidebarRef}
					// onMouseMove={handleMouseMove}
					// onMouseUp={handleMouseUp}
					// onMouseLeave={handleMouseUp} // Ensure dragging stops when leaving the container
				>
					<div
						onMouseDown={(e) => handleDragStart(e, "top")}
						style={{ minHeight: "5px", cursor: "ns-resize" }}
					/>
					<div
						onMouseDown={(e) => handleDragStart(e, "left")}
						style={{
							position: "absolute",
							width: "5px",
							height: "100%",
							top: 0,
							left: 0,
							minHeight: "5px",
							cursor: "ew-resize",
						}}
					/>
					<CollapseButton
						onClick={() => handleCollapsedChange(!isCollapsed)}
						side={side}
						isCollapsed={isCollapsed}
					/>
					{children}
					{/* <div
						style={{
							position: "absolute",
							bottom: 0,
							right: 0,
							width: "10px",
							height: "10px",
							cursor: "se-resize",
							backgroundColor: "gray",
							zIndex: "9999",
						}}
						onMouseDown={handleResizeStart}
					/>

					<div
						style={{
							position: "absolute",
							bottom: 0,
							right: 0,
							width: "10px",
							height: "10px",
							cursor: "se-resize",
							backgroundColor: "gray",
						}}
						onMouseDown={handleResizeStart}
					/> */}
				</div>
			</ContentWrapper>
		</CollapsibleContainer>
	);
};

export default CollapsibleWrapper;
