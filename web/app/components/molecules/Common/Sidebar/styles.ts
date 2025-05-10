import styled from "@emotion/styled";
import Sider from "app/components/atoms/Sider";
import { theme } from "~/styles/theme";

export const StyledSidebar = styled(Sider)<{ collapsed: boolean }>`
  && {
    background-color: ${theme.colors.white};
    height: calc(100vh -  ${theme.dimensions.headerHeight});
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    border-top: 1px solid #f0f0f0;
    border-right: 1px solid #f0f0f0;

    ${(props) =>
			props.collapsed &&
			`
        flex: 0 0 40px !important;
        max-width: 40px !important;
        min-width: 40px !important;
        width: 40px !important;
      `};
  }

  .ant-menu {
    width: unset;
    border-inline-end: unset !important;

    .ant-menu-item {
      margin: unset;
      width: 100%;
      border-radius: unset;

      .ant-menu-item-icon {
        vertical-align: unset;

        ${(props) => props.collapsed && "transform: translateX(2px);"};
      }

      .ant-menu-title-content {
        transition: unset;
      }
    }

    .ant-menu-item-selected {
      background-color: ${theme.colors.paleSkyBlue};

      .ant-menu-item-icon svg path {
        stroke: ${theme.colors.brightRoyalBlue};
      }
    }

    .ant-layout-sider-trigger {
      background-color: ${theme.colors.white};
      color: ${theme.colors.darkBlue};
      text-align: left;
      padding: 0 20px;
      margin: 0;
      height: 38px;
      line-height: 38px;
      cursor: pointer;
    }

    .ant-menu-inline {
      border-right: none !important;

      & > li {
        padding: 0 20px;
      }
    }

    .ant-menu-vertical {
      border-right: none;
    }
  }

  .collapse-button {
    padding: 9px 12px;
    gap: 8px;
    text-align: center;
    cursor: pointer;
    color: ${theme.colors.darkBlue};
    position: absolute;
    bottom: 0;
    width: 100%;
    display: flex;
    justify-content: flex-end;
    border: unset;
    background-color: unset;

    ${(props) => props.collapsed && "justify-content: center;"};
 }
`;
