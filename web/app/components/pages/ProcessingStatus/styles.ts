import styled from "@emotion/styled";
import { theme } from "~/styles/theme";

export const ProcessingStatusS = styled.div`
  input,
  .ant-select-selector,
  .ant-btn {
    border-radius: ${theme.borderRadius.tiny} !important;
  }

  .ant-pagination .ant-pagination-item {
    border-radius: ${theme.borderRadius.tiny} !important;
  }
`;

export const ProcessingStatusViewerS = styled.div`
  height: calc(100vh - ${theme.dimensions.headerAndTitleHeight});

  .left-item {
    min-width: ${theme.dimensions.minWidthLeftCenterAreaLarge};
    border-right: 2px solid ${theme.colors.lightGray};

    .wrap-pagination {
      display: flex;
      justify-content: flex-end;
      background: ${theme.colors.veryLightGray};
      padding: 16px;
    }

    .button-bottom {
      padding: 12px 16px;
      gap: 10px;
      border: 1px 0px 0px 0px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      background: ${theme.colors.white};

      button {
        &:hover {
          svg path {
            stroke: ${theme.colors.brightRoyalBlue};
          }
        }
      }

      .ant-btn-default:disabled {
        svg path {
          stroke: ${theme.colors.lightGray} !important;
        }
      }
    }
  }

  .center-item {
    min-width: ${theme.dimensions.minWidthRightArea};

    .h-100 {
      height: 100%;
    }

    .h-40 {
      height: 40%;
    }

    .h-60 {
      height: 60%;
    }

    .b-bottom {
      border-bottom: 2px solid ${theme.colors.lightGray};
    }
  }
`;

export const WrapFilterTable = styled.div`
  padding-top: 1rem;
  padding-bottom: 1rem;
  height: calc(100% - ${theme.dimensions.headerTable});

  .filter {
    display: flex;
    display: flex;
    align-items: center;
    padding-left: 1.25rem;
    padding-right: 1.25rem;

    .input-search {
      height: 24px;
      width: 148px;
    }

    .button-search {
      background-color: ${theme.colors.white};
      border: 1px solid ${theme.colors.lightGray};
      border-left: unset;
      padding: 0px 5px 0px 5px;
      height: 24px;
    }
  }
`;

export const TableS = styled.div`
  margin-bottom: 8px;
  width: 100%;
  overflow: auto;
  height: calc(100% - 8px);

  .table {
    min-width: 1200px;
    display: block;
  }

  thead tr th {
    background-color: ${theme.colors.softWhite} !important;
    border-bottom: unset !important;
  }
  tbody tr td {
    background-color: ${theme.colors.softWhite} !important;
    border-bottom: unset !important;
    word-break: break-all;
  }

  .selected-row {
    background-color: ${theme.colors.lightIceBlue} !important;
    color: ${theme.colors.vividBlue} !important;

    svg path {
      stroke: ${theme.colors.brightRoyalBlue};
    }

    td {
      background-color: ${theme.colors.lightIceBlue} !important;
    }
  }
`;

export const RightComponentS = styled.div`
  height: 100%;

  .ticket-id {
    height: 5%;
    width: 100%;
    color: ${theme.colors.semiBlack};
    background-color: ${theme.colors.white};
    font-size: ${theme.fontSize.large};
    font-weight: ${theme.fontWeight.bold};
    line-height: 22px;
    padding: 8px 10px;
    margin: 0;

    span {
      font-weight: ${theme.fontWeight.normal};
    }
  }

  .ant-tabs {
    height: 95%;

    .ant-tabs-nav {
      margin-bottom: unset;
      padding: 8px 16px 0px 16px;

      .ant-tabs-nav-list {
        gap: 4px;

        .ant-tabs-tab {
          border-radius: 0;
        }

        .ant-tabs-tab-active {
          .ant-tabs-tab-btn {
            color: ${theme.colors.vividBlue};
            text-shadow: unset;
          }
        }
      }
    }

    .ant-tabs-content {
      height: 100%;

      .ant-tabs-tabpane {
        height: 100%;
      }
    }
  }
`;

export const OutputS = styled.div`
  height: 100%;

  .wrap-loading {
    height: 100%;
    display: flex;
    padding-top: 12px;
    justify-content: center;

    .loading {
      padding: 72px;
      text-align: center;

      .rotate-path .ant-progress-circle-path {
        animation: rotate-path 2s linear infinite;
        transform-origin: center;
      }

      @keyframes rotate-path {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .step {
        font-size: ${theme.fontSize.large};
        font-weight: ${theme.fontWeight.normal};
        line-height: 22px;
        color: ${theme.colors.semiBlack};
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        margin-bottom: 4px;
      }

      .process {
        margin-bottom: 70px;
      }

      .processing {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        font-size: ${theme.fontSize.large};
        font-weight: ${theme.fontWeight.normal};
        line-height: 22px;
        color: ${theme.colors.semiBlack};
        margin-bottom: 10px;
      }

      .name {
        text-align: center;
        font-size: ${theme.fontSize.large};
        font-weight: ${theme.fontWeight.normal};
        line-height: 22px;
        color: ${theme.colors.semiBlack};
        margin-bottom: 10px;
      }

      .note {
        margin: 24px 0;
        font-size: ${theme.fontSize.large};
        font-weight: ${theme.fontWeight.normal};
        line-height: 22px;
        color: ${theme.colors.transparentSemiBlack};
      }
    }
  }

  .viewer {
    height: 90%;
    .h-100 {
      height: 100%;
    }

    .h-40 {
      height: 40%;
    }

    .h-60 {
      height: 60%;
    }

    .b-bottom {
      border-bottom: 2px solid ${theme.colors.lightGray};
    }
  }

  .button-bottom {
    height: 10%;
    padding: 12px 16px;
    gap: 10px;
    border: 1px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    background: ${theme.colors.white};

    button {
      &:hover {
        svg path {
          stroke: ${theme.colors.brightRoyalBlue};
        }

        &:last-child {
          svg path {
            stroke: unset;
          }
        }
      }
    }
  }

  .generate-error {
    padding: 10px;

    .error {
      margin-bottom: 5px;
    }
  }
`;
