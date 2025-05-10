import styled from "@emotion/styled";
import { theme } from "~/styles/theme";

export const AccountM = styled.div`
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
`;

export const AccountManagerLayoutS = styled.div`
  height: calc(100vh - ${theme.dimensions.headerAndTitleHeight});

  &.zoom-schema {
    grid-template-columns: 0fr 4fr 1fr;
  }

  .left-item,
  .center-item,
  .right-item {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }
  
  .left-item {
    min-width: ${theme.dimensions.minWidthLeftCenterAreaLarge};
  }
  
  .right-item {
    min-width: ${theme.dimensions.minWidthRightArea};
  }

  .left-item,
  .center-item {
    border-right: 2px solid ${theme.colors.lightGray};
  }

  .center-item {
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
      }
    }
  }
`;

export const AccountsTableS = styled.div`
  height: 100%;

  .filter-table {
    padding-top: 1rem;
    padding-bottom: 1rem;
    height: calc(100% - 60px);

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
		
		span {
			margin-top: 8px;
			margin-bottom: 12px;
		}
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

    .emails {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 6px;

      .email-item {
        display: flex;
        align-items: center;
      }
    }

    .button-add-link {
      display: flex;
      justify-content: center;
	  padding-top: 16px;
	  padding-bottom: 6px;
	  font-size: ${theme.fontSize.large};
	  color: ${theme.colors.transparentSemiBlack};
		span {
			margin-right: 4px;
		}
    }

    .uc-wrapper {
      display: flex;
      justify-content: center;
    }

    .uc-select {
      width: 100%;
      max-height: 32px;
      overflow: hidden;
      visibility: hidden;
    }

    .button-add-uc {
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
`;
