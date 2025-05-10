import styled from "@emotion/styled";
import { theme } from "~/styles/theme";

export const CollapsibleContainer = styled.div<{
	isCollapsed: boolean;
	side: "left" | "right";
	height?: number;
}>`
  transition: all 0.3s ease;
  z-index: 1;
  width: ${({ isCollapsed, side }) => {
		if (isCollapsed) return "40px";
		return side === "right" ? "600px" : "320px";
	}};

  min-width: ${({ isCollapsed, side }) => {
		if (isCollapsed) return "40px";
		return side === "right" ? "600px" : "320px";
	}};
  position: relative;
  background: ${({ isCollapsed }) => {
		if (isCollapsed) return "white";
	}};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  height: ${({ isCollapsed, height = 400 }) =>
		isCollapsed ? "35px" : `${height}px`};
  align-self: ${({ isCollapsed, side }) => {
		if (isCollapsed) {
			return side === "right" ? "flex-end" : "flex-start";
		}
		return "stretch";
	}};
  border-radius: 4px;
  margin-left: ${({ side }) => (side === "right" ? "auto" : "0")};
  pointer-events: auto;
`;

export const CollapseButton = styled.button<{
	isCollapsed: boolean;
	side: "left" | "right";
}>`
  position: absolute;
  ${({ side }) => (side === "right" ? "right: 8px;" : "right: 6px;")};
  top: 5px;
  width: 32px;
  height: 32px;
  border-radius: 12px;
  background: transparent;
  color: ${theme.colors.semiBlack};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.3s ease;
  padding: 0;

  svg {
    transition: transform 0.3s ease;
    transform: ${({ isCollapsed, side }) => {
			if (side === "right") {
				return isCollapsed ? "rotate(0deg)" : "rotate(180deg)";
			}
			return isCollapsed ? "rotate(180deg)" : "rotate(0deg)";
		}};
  }
`;

export const ContentWrapper = styled.div<{ isCollapsed: boolean }>`
  opacity: ${({ isCollapsed }) => (isCollapsed ? 0 : 1)};
  visibility: ${({ isCollapsed }) => (isCollapsed ? "visible" : "visible")};
  transition: all 0.3s ease;
  overflow: hidden;
  height: ${({ isCollapsed }) => (isCollapsed ? "0" : "100%")};
`;

export const CollapsedIndicator = styled.div<{ isCollapsed: boolean }>`
  display: ${({ isCollapsed }) => (isCollapsed ? "flex" : "none")};
  flex-direction: column;
  align-items: center;
  gap: 4px;
  opacity: ${({ isCollapsed }) => (isCollapsed ? 1 : 0)};
  height: fit-content;
  margin-top: 4px;

  .icon-wrapper {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.colors.semiBlack};
  }

  .text-wrapper {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    color: ${theme.colors.semiBlack};
    font-weight: 500;
    font-size: 14px;
    white-space: nowrap;
    line-height: 1;
  }
`;
