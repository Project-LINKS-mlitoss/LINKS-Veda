import styled from "@emotion/styled";
import { theme } from "~/styles/theme";

export const AssetsPageS = styled.div`
  input,
  .ant-select-selector,
  .ant-btn {
    border-radius: ${theme.borderRadius.tiny} !important;
  }

  .ant-pagination .ant-pagination-item {
    border-radius: ${theme.borderRadius.tiny} !important;
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

    td {
      background-color: ${theme.colors.lightIceBlue} !important;
    }
  }
`;

export const AssetViewerS = styled.div`
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
      justify-content: space-between;
      background: ${theme.colors.white};

      .button-upload {
        &:hover {
          svg path {
            fill: ${theme.colors.brightRoyalBlue} !important;
          }
        }
      }

      .button-right {
        gap: 10px;
        display: flex;
        align-items: center;

        button {
          &:hover {
            svg path {
              stroke: ${theme.colors.brightRoyalBlue};
            }
          }

          &:first-child {
            &:hover {
              svg path {
                fill: ${theme.colors.coralPink};
                stroke: unset;
              }
            }
          }
        }

        .ant-btn-background-ghost:disabled {
          svg path {
            fill: ${theme.colors.lightGray} !important;
          }
        }
        .ant-btn-default:disabled {
          svg path {
            stroke: ${theme.colors.lightGray} !important;
          }
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

export const OperatorS = styled.div`
  background-color: ${theme.colors.softWhite};
  height: 100%;

  .struc-origin {
    display: flex;
    justify-content: center;
    padding: 14px;
    overflow-y: auto;

    button {
      width: 100%;
      height: 32px;
      border-radius: ${theme.borderRadius.tiny};

      .ant-btn-icon {
        position: absolute;
        left: 15px;
        top: 50%;
        transform: translateY(-50%);
      }

      svg path {
        transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
      }

      &:hover {
        svg path {
          stroke: ${theme.colors.azureBlue} !important;
        }
      }
    }
  }
`;

export const TemplateS = styled.div`
  background-color: ${theme.colors.softWhite};
  height: 100%;
`;

export const ModalContent = styled.div`
  margin: 24px 0;

  .question {
    font-size: 14px;
    font-weight: ${theme.fontWeight.normal};
    line-height: 22px;
    color: ${theme.colors.semiBlack};
    margin-bottom: 16px;
  }

  .name {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 6px;
    padding: 8px;
    border: 1px solid ${theme.colors.lightGray};

    font-size: 14px;
    font-weight: ${theme.fontWeight.normal};
    line-height: 22px;
    color: ${theme.colors.semiBlack};
  }

  .form {
    margin-top: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: flex-end;
  }
`;
