import styled from "@emotion/styled";
import { theme } from "~/styles/theme";
import { CELL_MODE } from "./types";

export const ContentS = styled.div`
  input,
  .ant-select-selector {
    border-radius: unset !important;
  }

  .ant-pagination .ant-pagination-item {
    border-radius: unset !important;
  }

  .title-table {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .loading {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
`;

export const ContentLayoutS = styled.div<{
	isPreview: boolean;
	isDetail: boolean;
	isCollapsedGISViewer: boolean;
}>`
  height: calc(100vh - ${theme.dimensions.headerAndTitleHeight});

  .left-item {
    min-width: ${({ isDetail, isPreview }) =>
			isDetail
				? "unset"
				: isPreview
					? theme.dimensions.minWidthLeftCenterArea
					: theme.dimensions.minWidthLeftCenterAreaLarge};
  }

  .center-item {
    min-width: ${({ isDetail }) =>
			isDetail
				? theme.dimensions.minWidthLeftCenterAreaLarge
				: theme.dimensions.minWidthLeftCenterArea};

    .h-100 {
      height: 100%;
    }

    .h-10 {
      height: 10%;
    }

    .h-90 {
      height: 90%;
    }

    .h-30 {
      height: 30%;
    }

    .h-40 {
      height: 40%;
    }

    .h-60 {
      height: 60%;
    }

    .h-70 {
      height: 70%;
    }

    .b-bottom {
      border-bottom: 2px solid ${theme.colors.lightGray};
    }

    .content-name {
      padding: 12px;

      span {
        font-size: ${theme.fontSize.large};
        font-weight: ${theme.fontWeight.normal};
        line-height: 22px;
        margin-bottom: 4px;
      }

      .name {
        padding: 5px 12px 5px 12px;
        gap: 12px;
        border-radius: 2px;
        border: 1px solid ${theme.colors.lightGray};
        background: ${theme.colors.white};
        margin: 0;
        font-size: ${theme.fontSize.large};
        font-weight: ${theme.fontWeight.normal};
        line-height: 22px;
        color: ${theme.colors.semiBlack};
      }
    }

    .gis-viewer {
      height: ${({ isCollapsedGISViewer }) =>
				isCollapsedGISViewer ? theme.dimensions.headerHeight : "40%"}; ;
    }


  }

  .right-item {
    min-width: ${theme.dimensions.minWidthRightArea};
  }

  .left-item,
  .center-item {
    border-right: 2px solid ${theme.colors.lightGray};
  }
`;

export const ContentsTableS = styled.div`
  height: 100%;

  .filter-table {
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
  }

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

      &.button-delete {
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
  }

  .selected-row {
    background-color: ${theme.colors.lightIceBlue} !important;
    color: ${theme.colors.vividBlue} !important;

    td {
      background-color: ${theme.colors.lightIceBlue} !important;
    }
  }
`;

export const ContentViewerS = styled.div`
  height: 100%;
  width: 100%;
  position: relative;

  .content-viewer-table {
    height: 75%;
    background-color: white;
    overflow: auto;

    div {
      height: 100%;
    }
    input {
      border: unset !important;
      box-shadow: unset !important;
    }

    .ant-table-content {
      overflow: auto !important;
    }

    .ant-table-thead > tr > th {
      .title-col {
        display: flex;
        align-items: center;
        padding: 0 0 0 8px;

        input {
          background-color: ${theme.colors.softWhite};
          margin: 0;
          padding: 4px 11px 4px 8px;
        }
      }
    }

    .icon-column {
      background: ${theme.colors.softWhite};
    }

    .ant-table-cell {
      white-space: nowrap;
      padding: unset;

      .col-name {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }

    .cellAdded,
    .cellEdited {
      background-color: ${theme.colors.lightIceBlue};
      input {
        color: ${theme.colors.vividBlue} !important;
        background-color: ${theme.colors.lightIceBlue} !important;
      }
    }

    .cellDeleted {
      background-color: ${theme.colors.veryLightGray};
      input {
        color: ${theme.colors.mediumGray} !important;
        background-color: ${theme.colors.veryLightGray} !important;
      }
    }

    .titleAdded,
    .titleEdited {
      background-color: ${theme.colors.lightIceBlue};
      svg path {
        stroke: ${theme.colors.vividBlue} !important;
      }
      input {
        color: ${theme.colors.vividBlue} !important;
        background-color: ${theme.colors.lightIceBlue} !important;
      }
    }

    .titleDeleted {
      background-color: ${theme.colors.veryLightGray};
      input {
        color: ${theme.colors.mediumGray} !important;
        background-color: ${theme.colors.veryLightGray} !important;
      }
    }
  }

  .wrap-pagination {
    width: 100%;
    height: 10%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 10px;
    background: ${theme.colors.veryLightGray};

    .content-viewer-pagination {
      .ant-pagination {
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        .ant-pagination-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
      }
    }
  }

  .button-bottom {
    height: 15%;
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

export const ModalContent = styled.div`
  margin: 24px 0 0;

  .modal-item {
    margin-bottom: 20px;

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
      margin-bottom: 16px;
    }
  }

  .form {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: flex-end;
  }

  .edit-modal {
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

  .form-edit-name {
    input {
      margin-top: 16px;
      padding: 5px 12px 5px 12px;
      border-radius: 2px;
      height: 40px;
    }

    .buttons {
      margin-top: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: flex-end;
    }
  }
`;

export const ManagementS = styled.div`
  background: ${theme.colors.softWhite};
  padding: 16px 8px;

  .management-item {
    padding: 0 0 16px;
    margin-bottom: 16px;
    border-bottom: 1px solid ${theme.colors.transparentLightGray};

    &:last-child {
      margin-bottom: unset;
      border: unset;
    }

    &.content-detail {
      .text {
        color: #595959;
        font-size: 12px;
      }
    }

    .management-item-title {
      font-size: ${theme.fontSize.large};
      font-weight: ${theme.fontWeight.normal};
      line-height: 22px;
      text-align: left;
      color: ${theme.colors.transparentSemiBlack};
      margin-bottom: 10px;

      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .management-item-link {
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: ${theme.colors.azureBlue};
    }

    .data-creation-wrapper {
      display: flex;
      align-items: center;
    }

    .status {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .wrap-link-item {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .link-item {
        display: flex;
        align-items: center;
        gap: 6px;

        .link-item-name {
          padding: 1px 8px;
          gap: 3px;
          border-radius: ${theme.borderRadius.tiny};
          border: 1px solid ${theme.colors.lightGray};

          font-size: ${theme.fontSize.large};
          font-weight: ${theme.fontWeight.normal};
          line-height: 20px;
          color: ${theme.colors.darkGrayish};
          width: 95%;
          height: 25px;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
        }
        
        .cursor-default {
          cursor: default !important;
        }

        .link-item-link {
          font-size: ${theme.fontSize.medium};
          font-weight: ${theme.fontWeight.normal};
          line-height: 22px;
          color: ${theme.colors.semiBlack};
          text-decoration: underline;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          line-clamp: 1;
          -webkit-box-orient: vertical;
        }
      }
    }

    .visualize-select {
      width: 100%;
      max-height: 32px;
      overflow: hidden;
      visibility: hidden;
    }

    .button-add-visualize {
      width: 100%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;
    }
  }

  .update {
    .update-info {
      font-size: ${theme.fontSize.medium};
      font-weight: ${theme.fontWeight.normal};
      line-height: 20px;
      color: ${theme.colors.darkGrayish};
      margin-bottom: 10px;

      &:last-child {
        margin-bottom: unset;
      }
    }
  }
  
  .dataset-item {
    min-width: 95%;
    button {
      width: 100%;
    }
    
    .dataset-name {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
  }
`;

export const ModalAddColumn = styled.div`
  padding: 24px 0 0 0;

  .question {
    font-size: 14px;
    font-weight: ${theme.fontWeight.normal};
    line-height: 22px;
    color: ${theme.colors.semiBlack};
    margin-bottom: 16px;
  }

  .form-add-col {
    label {
      font-size: 14px;
      font-weight: ${theme.fontWeight.normal};
      line-height: 22px;
      color: ${theme.colors.semiBlack};
      margin-bottom: 4px;

      span {
        color: ${theme.colors.fieryRed};
      }
    }
    input {
      padding: 5px 12px 5px 12px;
      border-radius: 2px;
      height: 40px;
      margin-bottom: 16px;
    }

    .buttons {
      margin-top: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: flex-end;
    }
  }
`;

export const ContentItemTable = styled.div`
  height: 100%;
  width: 100%;
  position: relative;

  .loading-save {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #d9d9d973;
    z-index: 1;
  }

  .h-90 {
    height: 90%;
  }

  .h-80 {
    height: 80%;
  }

  .content-viewer-table {
    background-color: white;
    overflow: auto;

    .ant-table {
      input {
        border: unset !important;
        box-shadow: unset !important;
      }

      .ant-table-content table {
        border-collapse: collapse;
      }

      .ant-table-container {
        .action {
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          width: 100%;
        }

        td.ant-table-cell {
          padding: 0;
        }

        th.ant-table-cell {
          padding: 0;
          background: #fafafa;

          & > div {
            padding: 0 8px;
          }
        }

        .ant-table-body {
          max-height: unset !important;
        }
      }
    }

    .ant-pagination {
      margin: 0;
      padding: 16px;
      background: #f0f0f0;
    }
  }

  .wrap-pagination {
    width: 100%;
    height: 10%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 10px;
    background: ${theme.colors.veryLightGray};

    .content-viewer-pagination {
      .ant-pagination {
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        .ant-pagination-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
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

export const CellWrapperStyled = styled.div<{ mode: CELL_MODE }>`
  height: 39px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ mode }) =>
		mode === CELL_MODE.DELETED
			? "#777777"
			: mode === CELL_MODE.EDITED || mode === CELL_MODE.NEW
				? "#1890FF"
				: "rgba(0, 0, 0, 0.85)"} !important;
  background-color: ${({ mode }) =>
		mode === CELL_MODE.DELETED
			? "#D9D9D9"
			: mode === CELL_MODE.EDITED || mode === CELL_MODE.NEW
				? "#E6F7FF"
				: "#FFF"} !important;

  .ant-input {
    color: ${({ mode }) =>
			mode === CELL_MODE.DELETED
				? "#777777"
				: mode === CELL_MODE.EDITED || mode === CELL_MODE.NEW
					? "#1890FF"
					: "rgba(0, 0, 0, 0.85)"} !important;
    background-color: ${({ mode }) =>
			mode === CELL_MODE.DELETED
				? "#D9D9D9"
				: mode === CELL_MODE.EDITED || mode === CELL_MODE.NEW
					? "#E6F7FF"
					: "#FFF"} !important;
    margin: 0;
    padding: 4px 11px 4px 8px;
  }
`;
