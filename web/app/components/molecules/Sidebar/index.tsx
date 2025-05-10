import { useNavigate } from "@remix-run/react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "~/components/atoms/Icon";
import { theme } from "~/styles/theme";
import {
	Content,
	DragHandle,
	Header,
	HeaderIcons,
	HeaderTitle,
	IconWrapper,
	SidebarContainer,
} from "./styled";

export interface SidebarProps {
	/** Title displayed in the header */
	title: string;
	/** Initial width of the sidebar in pixels */
	initialWidth?: number;
	/** Minimum width the sidebar can be resized to */
	minWidth?: number;
	/** Maximum width the sidebar can be resized to */
	maxWidth?: number;
	/** Custom icon to replace the default back arrow */
	customIcon?: React.ReactNode;
	/** Handler for when the back/custom icon is clicked */
	onBackClick?: () => void;
	/** Whether the sidebar can be minimized */
	minimizable?: boolean;
	/** Whether the sidebar can be resized */
	resizable?: boolean;
	/** Whether the sidebar can be dragged */
	draggable?: boolean;
	/** CSS class name for additional styling */
	className?: string;
	/** Content to be rendered inside the sidebar */
	children: React.ReactNode;
	/** Width of the sidebar when minimized */
	minimizedWidth?: number;
	zIndex?: number;
	height?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
	title,
	initialWidth,
	minWidth = 200,
	maxWidth = 3000,
	customIcon,
	onBackClick,
	minimizable = true,
	resizable = true,
	draggable = false,
	className,
	children,
	minimizedWidth = 48,
	zIndex = 1000,
	height,
}) => {
	const navigate = useNavigate();

	const [width, setWidth] = useState(340);
	const [isMinimized, setIsMinimized] = useState(false);
	const [position, setPosition] = useState({ x: 10, y: 10 });

	const sidebarRef = useRef<HTMLDivElement>(null);
	const isDraggingRef = useRef(false);
	const isResizingRef = useRef(false);
	const dragStartPosRef = useRef({ x: 0, y: 0 });

	// Handle resize functionality
	const handleResizeStart = useCallback(
		(e: React.MouseEvent) => {
			if (!resizable) return;
			e.preventDefault();
			isResizingRef.current = true;
			document.addEventListener("mousemove", handleResize);
			document.addEventListener("mouseup", handleResizeEnd);
		},
		[resizable],
	);

	const handleResize = useCallback(
		(e: MouseEvent) => {
			if (!sidebarRef.current || !isResizingRef.current) return;
			const newWidth =
				e.clientX - sidebarRef.current.getBoundingClientRect().left;
			setWidth(Math.min(Math.max(newWidth, minWidth), maxWidth));
		},
		[minWidth, maxWidth],
	);

	const handleResizeEnd = useCallback(() => {
		isResizingRef.current = false;
		document.removeEventListener("mousemove", handleResize);
		document.removeEventListener("mouseup", handleResizeEnd);
	}, [handleResize]);

	// Handle drag functionality
	const handleDragStart = useCallback(
		(e: React.MouseEvent) => {
			if (!draggable || e.target !== e.currentTarget) return;
			isDraggingRef.current = true;
			dragStartPosRef.current = {
				x: e.clientX - position.x,
				y: e.clientY - position.y,
			};
			document.addEventListener("mousemove", handleDrag);
			document.addEventListener("mouseup", handleDragEnd);
		},
		[draggable, position],
	);

	const handleDrag = useCallback((e: MouseEvent) => {
		if (!isDraggingRef.current) return;
		setPosition({
			x: e.clientX - dragStartPosRef.current.x,
			y: e.clientY - dragStartPosRef.current.y,
		});
	}, []);

	const handleDragEnd = useCallback(() => {
		isDraggingRef.current = false;
		document.removeEventListener("mousemove", handleDrag);
		document.removeEventListener("mouseup", handleDragEnd);
	}, [handleDrag]);

	const handleGoBack = useCallback(() => {
		setIsMinimized(false);
		navigate(-1);
	}, [navigate]);
	useEffect(() => {
		if (initialWidth) setWidth(initialWidth);
	}, [initialWidth]);

	return (
		<SidebarContainer
			ref={sidebarRef}
			style={{
				width: isMinimized ? `${minimizedWidth}px` : width,
				left: draggable ? position.x : 0,
				top: draggable ? position.y : 0,
				zIndex,
			}}
			className={className}
			isMinimized={isMinimized}
			height={height}
		>
			<Header onMouseDown={handleDragStart} draggable={draggable}>
				{isMinimized ? (
					<IconWrapper onClick={() => setIsMinimized(false)}>
						{customIcon || (
							<Icon icon="arrowLeft" size={24} color={theme.colors.semiBlack} />
						)}
					</IconWrapper>
				) : (
					<>
						<HeaderTitle>
							<IconWrapper onClick={onBackClick}>
								{customIcon || (
									<Icon
										icon="leftOutlined"
										size={24}
										color={theme.colors.semiBlack}
									/>
								)}
							</IconWrapper>
							<span>{title}</span>
						</HeaderTitle>
						{minimizable && (
							<HeaderIcons>
								<Icon
									icon="shrinkOutlined"
									size={20}
									onClick={() => setIsMinimized(true)}
								/>
							</HeaderIcons>
						)}
					</>
				)}
			</Header>

			{!isMinimized && (
				<>
					<Content>{children}</Content>
					{resizable && <DragHandle onMouseDown={handleResizeStart} />}
				</>
			)}
		</SidebarContainer>
	);
};

export default Sidebar;
