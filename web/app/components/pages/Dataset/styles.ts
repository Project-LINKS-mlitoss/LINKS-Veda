import styled from "@emotion/styled";
import Modal from "~/components/atoms/Modal";
import { theme } from "~/styles/theme";

export const DatasetS = styled.div`
  input,
  .ant-select-selector,
  .ant-btn {
    border-radius: ${theme.borderRadius.tiny} !important;
  }

  .ant-pagination .ant-pagination-item {
    border-radius: ${theme.borderRadius.tiny} !important;
  }
`;

export const DatasetLayoutS = styled.div`
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
      display: flex;
      align-items: center;
      justify-content: flex-end;
      background: ${theme.colors.white};

      .ant-btn-background-ghost:disabled {
        width: auto;
        svg path{
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

    .h-10 {
      height: 10%;
    }

    .h-90 {
      height: 90%;
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

export const ListContent = styled.div`
  .dataset {
    display: flex;
    gap: 16px;
    padding: 10px 0;

    .data {
      width: ${theme.dimensions.tempWidth}px;
      height: 96px;
      padding: 0px 20px 8px 20px;
      border-radius: ${theme.borderRadius.small};
      background: ${theme.colors.white};
      box-shadow: 0px 2px 8px 0px ${theme.colors.semiTransparentBlack};
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      .icon {
        display: flex;
        justify-content: center;
        padding: 5px 0;
      }

      .name {
        font-size: ${theme.fontSize.large};
        font-weight: ${theme.fontWeight.normal};
        line-height: 22px;
        color: ${theme.colors.semiBlack};
        overflow: hidden;
        word-break: break-all;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        line-clamp: 1;
        -webkit-box-orient: vertical;
      }

      &:hover,
      &.data-active {
        background: ${theme.colors.lightIceBlue};

        .icon {
          svg path {
            stroke: ${theme.colors.vividBlue};
          }
        }

        .name {
          color: ${theme.colors.vividBlue};
        }
      }
    }
  }

  .dataset-all {
    flex-wrap: wrap;
  }
`;

export const DatasetPreviewS = styled.div`
  height: 100%;
  width: 100%;
  position: relative;

  .name {
    font-size: ${theme.fontSize.large};
    font-weight: ${theme.fontWeight.normal};
    line-height: 22px;
    color: ${theme.colors.semiBlack};
    margin-bottom: 24px;
  }
`;

export const DatasetCreateEditS = styled.div<{ isPreview: boolean }>`
  height: ${({ isPreview }) =>
		isPreview
			? "unset"
			: `calc(100vh - ${theme.dimensions.headerAndTitleHeight})`};
  padding: ${({ isPreview }) => (isPreview ? "24px" : "0")};
  position: relative;

  input,
  textarea,
  .ant-select-selector {
    border-radius: ${theme.borderRadius.tiny};
  }

  .loading {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 0;
    left: 0;
    background-color: ${theme.colors.transparentLightGray};
    z-index: 1;
  }

  .wrap-setting {
    height: ${({ isPreview }) => (isPreview ? "unset" : "90%")};
    display: flex;
    justify-content: center;
    overflow-y: ${({ isPreview }) => (isPreview ? "unset" : "auto")};
    margin: 0 0 10px 0;

    .setting {
      padding: ${({ isPreview }) => (isPreview ? "unset" : "48px 24px")};
      width: ${({ isPreview }) => (isPreview ? "100%" : "60%")};

      @media screen and (max-width: ${theme.responsive.laptop}) {
        width: 100%;
      }

      .title-publish {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 20px;

        p {
          font-size: ${theme.fontSize.large};
          font-weight: ${theme.fontWeight.normal};
          line-height: 22px;
          color: ${theme.colors.semiBlack};
          margin: unset;
        }

        .name-use-case {
          .name-use-case-item {
            display: grid;
            grid-template-columns: 1fr 3fr;
            align-items: center;
            gap: 10px;
            margin-bottom: 8px;
          }
        }

        .publish {
          display: flex;
          align-items: center;
          gap: 12px;

          span {
            font-size: 13px;
            font-weight: ${theme.fontWeight.normal};
            line-height: 22px;
            color: ${theme.colors.transparentSemiBlack};
          }
        }
      }

      .setting-item {
        padding: 8px 8px 12px 30px;
        border-radius: 6px;
        background: ${theme.colors.white};
        box-shadow: 0px 2px 8px 0px ${theme.colors.semiTransparentBlack};
        margin-bottom: 10px;

        .setting-item-title {
          font-size: ${theme.fontSize.large};
          font-weight: ${theme.fontWeight.normal};
          line-height: 22px;
          color: ${theme.colors.semiBlack};
          margin-bottom: 10px;
        }

        .setting-item-content {
          padding: 4px 12px 4px 0px;
          border-radius: 2px;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          justify-content: center;

          .setting-item-info {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;

            .name-metadata {
              padding: 8px;
              border: 1px solid ${theme.colors.lightGray};
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: flex-start;
              flex: 1;
              gap: 6px;
              font-size: ${theme.fontSize.large};
              font-weight: ${theme.fontWeight.normal};
              line-height: 22px;

              span:last-child {
                width: 100%;
                overflow: hidden;
                word-break: break-all;
                display: -webkit-box;
                -webkit-line-clamp: 1;
                line-clamp: 1;
                -webkit-box-orient: vertical;
              }
            }

            .action {
              display: flex;
              gap: 12px;
              flex-shrink: 0;
              width: 68px;

              button {
                padding: 0;
                background: transparent !important;
                box-shadow: none !important;
                font-size: 13px;
                font-weight: ${theme.fontWeight.normal};
                line-height: 22px;
                color: ${theme.colors.transparentSemiBlack};
              }

              .button-action {
                text-decoration: underline;
              }
            }
          }

          .notice {
            font-size: ${theme.fontSize.large};
            font-weight: ${theme.fontWeight.bold};
            line-height: 22px;
            color: ${theme.colors.transparentSemiBlack};
          }

          .button-add {
            font-size: ${theme.fontSize.large};
            font-weight: ${theme.fontWeight.bold};
            line-height: 22px;
            color: ${theme.colors.transparentSemiBlack};
          }
        }
      }
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
`;

export const ModalSelectContentS = styled.div`
  margin: 24px 0;

  .filter {
    display: flex;
    align-items: center;
    width: 100%;
    margin-bottom: 10px;

    .input-search {
      height: 24px;
      border-radius: ${theme.borderRadius.tiny};
    }

    .button-search {
      background-color: ${theme.colors.white};
      border: 1px solid ${theme.colors.lightGray};
      border-left: unset;
      padding: 0px 5px 0px 5px;
      height: 24px;
      display: flex;
      align-items: center;
    }
  }

  .table-file {
    * {
      border-radius: ${theme.borderRadius.tiny} !important;
    }

    .col-name {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    tr {
      cursor: pointer;
    }

    .selected-row {
      background: ${theme.colors.lightIceBlue} !important;

      td {
        background: ${theme.colors.lightIceBlue} !important;
        color: ${theme.colors.vividBlue} !important;
      }
    }
    
    .disabled-row {
      background: ${theme.colors.skyBlue} !important;
      opacity: 0.6;
      cursor: not-allowed !important;
      
      td {
        background: ${theme.colors.skyBlue} !important;
        color: ${theme.colors.vividBlue} !important;
      }
    }
  }

  .buttons {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    background: transparent;
    margin-top: 24px;
    padding: 0;
  }
`;

export const ModalS = styled(Modal)`
  .ant-modal-header {
    padding: 0 24px;
  }
  .ant-modal-content {
    padding: 0;
    padding-top: 20px;
    border-radius: 2px;
  }
`;

export const ModalContent = styled.div`
  margin: 24px 0 0;
  .buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 292px;
    border-top: 1px solid ${theme.colors.veryLightGray};
    border-bottom: 1px solid ${theme.colors.veryLightGray};
    padding: 20px 24px;

    .active-button {
      color: ${theme.colors.vividBlue};
      border-color: ${theme.colors.vividBlue};
    }

    .title {
      font-size: ${theme.fontSize.large};
      font-weight: ${theme.fontWeight.normal};
      line-height: 22px;
      color: ${theme.colors.black};
      margin-bottom: 4px;
    }

    .option {
      display: flex;
      flex-wrap: wrap;
      max-width: 100%;
      gap: 10px;

      button {
        flex: 0 48%;
        box-sizing: border-box;
        height: 40px;
        border-radius: 2px;
      }
    }
  }

  .back {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 10px;
    button {
      box-sizing: border-box;
      height: 40px;
      border-radius: 2px;
    }
  }
`;
