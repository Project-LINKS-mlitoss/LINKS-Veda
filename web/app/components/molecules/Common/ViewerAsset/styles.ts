import styled from "@emotion/styled";
import { theme } from "~/styles/theme";

export const SearchS = styled.div`
  display: flex;
  align-items: center;

  .input-search {
    height: 24px;
  }

  .button-search {
    background-color: ${theme.colors.white};
    border: 1px solid ${theme.colors.lightGray};
    border-left: unset;
    padding: 0px 5px 0px 5px;
    height: 24px;
  }
`;

export const TableS = styled.div`
  margin-bottom: 8px;
  width: 100%;
  overflow: auto;

  .table {
    width: 400px;
  }

  .disabled-table {
    pointer-events: none;
    opacity: 0.5;
    background-color: #f0f0f0;
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

export const FileViewerS = styled.div`
  background-color: ${theme.colors.veryLightGray};
  height: 100%;
  position: relative;
  padding: 10px;
  display: flex;
  flex-direction: column;

  .spin {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ant-table-wrapper {
    border: 1px solid ${theme.colors.lightSilver};
    flex: 1;
    overflow-x: auto;

    .ant-table {
      width: 100%;
      table-layout: fixed;
      height: 100%;

      .ant-table-container {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .ant-table-thead > tr > th,
      .ant-table-tbody > tr > td {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        background-color: ${theme.colors.white};
      }
    }
  }

  img {
    max-width: 100%;
    height: auto;
    object-fit: contain;
  }

  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
`;

export const TableViewerS = styled.div`
  background-color: ${theme.colors.softWhite};
  padding-top: 1rem;
  padding-left: 1.25rem;
  padding-right: 1.25rem;
  padding-bottom: 1rem;
  overflow: auto;
  height: 100%;
  width: 100%;

  input,
  .ant-select-selector {
    border-radius: unset !important;
  }

  .ant-pagination .ant-pagination-item {
    border-radius: unset !important;
  }
`;
