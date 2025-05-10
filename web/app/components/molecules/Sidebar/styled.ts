import styled from "@emotion/styled";
import { theme } from "~/styles/theme";

export const SidebarContainer = styled.div<{
	isMinimized: boolean;
	height?: string;
}>`
  position: absolute;
  background: ${theme.colors.white};
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  z-index: 1000;
  overflow: hidden;
  height: ${(props) => (props.isMinimized ? "48px" : props.height ?? "81vh")};
  margin-top: 16px;
  margin-left: 16px;
`;

export const Header = styled.div<{ draggable?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: ${theme.colors.white};
  border-bottom: 1px solid ${theme.colors.border};
  cursor: ${(props) => (props.draggable ? "move" : "default")};
  min-height: 48px;
  user-select: none;
`;

export const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
`;

export const HeaderIcons = styled.div`
  display: flex;
  gap: 8px;
  cursor: pointer;
`;

export const Content = styled.div<{ isMinimized?: boolean }>`
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  padding: ${(props) => (props.isMinimized ? "0" : "0px")};
`;

export const DragHandle = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  width: 4px;
  height: 100%;
  cursor: ew-resize;
  background: transparent;
  
  &:hover {
    background: ${theme.colors.border};
  }
`;

export const IconWrapper = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;
