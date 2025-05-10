import styled from "@emotion/styled";
import { theme } from "~/styles/theme";

export const WrapViewerS = styled.div`
  height: 100%;

  .children {
    height: calc(100% - ${theme.dimensions.headerHeight});
    overflow: auto;
    transition: all 0.3s ease;

    &.expanded {
      max-height: 100%;
      opacity: 1;
    }

    &.collapsed {
      max-height: 0;
      opacity: 0;
      pointer-events: none;
    }
  }
`;

export const HeaderViewer = styled.div`
  background-color: ${theme.colors.white};
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 8px;
  border-bottom: 1px solid ${theme.colors.lightGray};

  .icon-title {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .content {
      position: relative;
    }
  }

  .title-wrap-viewer {
    font-size: 14px;
    font-weight: ${theme.fontWeight.normal};
    line-height: 1.714;
  }
`;

export const ContentViewer = styled.div`
	background-color: ${theme.colors.softWhite};
	padding: 12px 16px;
`;

export const ActionsViewer = styled.div`
	padding: 12px 16px;
`;
