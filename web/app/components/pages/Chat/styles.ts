import styled from "@emotion/styled";
import { theme } from "~/styles/theme";
import { CELL_MODE } from "./types";

export const ChatS = styled.div`
  input,
  .ant-select-selector {
    border-radius: unset !important;
  }

  .file-name {
    display: flex;
    align-items: center;
    .file-label {
      color: ${theme.colors.transparentSemiBlack} !important;
      font-size: 12px;
    }
  }

  .ant-pagination .ant-pagination-item {
    border-radius: unset !important;
  }
`;

export const ChatMessageS = styled.div`
  height: calc(100vh - 115px);
  overflow: hidden;
  padding: 8px;
  background-color: ${theme.colors.white};
  display: flex;
  flex-direction: column;
  gap: 10px;

  .file-name {
    margin: 8px 0;
    span {
      margin-left: 12px;
    }
  }

  .body {
    padding: 20px 44px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background-color: ${theme.colors.lightGrayish};
    height: 100vh;
    max-height: 100vh;
    overflow-y: auto;

    .user {
      margin-left: 48px;
      padding: 16px 20px;
      background-color: ${theme.colors.white};
      box-shadow: 0px 2px 8px 0px ${theme.colors.semiTransparentBlack};
      filter: drop-shadow(0 1px 2px ${theme.colors.semiTransparentBlack});
      border-radius: 6px;
      position: relative;

      &::after {
        content: "";
        position: absolute;
        bottom: -10px;
        right: -9px;
        border-width: 15px 0px 15px 15px;
        border-style: solid;
        border-color: transparent transparent transparent ${theme.colors.white};
        display: block;
        width: 0;
        height: 0;
        transform: rotate(135deg);
      }
    }

    .bot {
      margin-right: 48px;
      padding: 16px 20px;
      background: ${theme.colors.lightIceBlue};
      box-shadow: 0px 2px 8px 0px ${theme.colors.semiTransparentBlack};
      filter: drop-shadow(0 1px 2px ${theme.colors.semiTransparentBlack});
      border-radius: 6px;
      position: relative;

      &::after {
        content: "";
        position: absolute;
        bottom: -10px;
        width: 0;
        height: 0;
        left: -7px;
        border-width: 15px 0px 15px 15px;
        border-style: solid;
        border-color: transparent transparent transparent
          ${theme.colors.lightIceBlue};
        transform: rotate(44deg);
      }
    }

    .typing {
      align-items: center;
      display: flex;
      width: 100px;
    }
    .typing .dot {
      animation: mercuryTypingAnimation 1.8s infinite ease-in-out;
      background-color: #6CAD96 ; //rgba(20,105,69,.7);
      border-radius: 50%;
      height: 7px;
      margin-right: 4px;
      vertical-align: middle;
      width: 7px;
      display: inline-block;
    }
    .typing .dot:nth-child(1) {
      animation-delay: 200ms;
    }
    .typing .dot:nth-child(2) {
      animation-delay: 300ms;
    }
    .typing .dot:nth-child(3) {
      animation-delay: 400ms;
    }
    .typing .dot:last-child {
      margin-right: 0;
    }

    @keyframes mercuryTypingAnimation {
      0% {
        transform: translateY(0px);
        background-color:#6CAD96;
      }
      28% {
        transform: translateY(-7px);
        background-color:#9ECAB9;
      }
      44% {
        transform: translateY(0px);
        background-color: #B5D9CB;
      }
    }
    
    .markdown-content h1 {
      font-size: 2.5em;
      margin: 0.5em 0;
      border-bottom: 2px solid #ddd;
      padding-bottom: 0.3em;
    }
    .markdown-content h2 {
      font-size: 2em;
      margin: 0.5em 0;
      border-bottom: 1px solid #ddd;
      padding-bottom: 0.2em;
    }
    .markdown-content h3 {
      font-size: 1.75em;
      margin: 0.5em 0;
    }
    .markdown-content h4 {
      font-size: 1.5em;
      margin: 0.5em 0;
    }
    .markdown-content h5, .markdown-content h6 {
      font-size: 1.25em;
      margin: 0.5em 0;
    }
    
    .markdown-content p {
      margin: 0.8em 0;
    }
    
    .markdown-content ul {
      list-style-type: disc;
      margin-left: 1.5em;
    }
    .markdown-content ol {
      list-style-type: decimal;
      margin-left: 1.5em;
    }
    .markdown-content li {
      margin: 0.5em 0;
    }
    
    .markdown-content blockquote {
      margin: 1em 0;
      padding: 0.5em 1em;
      background-color: #f9f9f9;
      border-left: 4px solid #ddd;
      font-style: italic;
      color: #555;
    }
    
    .markdown-content pre {
      background-color: #f4f4f4;
      padding: 1em;
      overflow-x: auto;
      border-radius: 5px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
    .markdown-content code {
      background-color: #f4f4f4;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }

    /* Bảng */
    .markdown-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
    }
    .markdown-content th,
    .markdown-content td {
      border: 1px solid #ddd;
      padding: 0.5em;
    }
    .markdown-content th {
      background-color: #f2f2f2;
      font-weight: bold;
      text-align: left;
    }
    .markdown-content td {
      text-align: left;
    }
    
    .markdown-content img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 1em 0;
    }
    
    .markdown-content a {
      color: #007bff;
      text-decoration: none;
    }
    .markdown-content a:hover {
      text-decoration: underline;
    }

  }

  .send {
    .button-submit {
      margin-top: 10px;
      width: 100%;
      display: flex;
      justify-content: end;
    }
  }
`;

export const ChatLayoutS = styled.div`
  height: calc(100vh - ${theme.dimensions.headerAndTitleHeight});

  .left-item {
    min-width: ${theme.dimensions.minWidthLeftCenterAreaLarge};
    border-right: 2px solid ${theme.colors.lightGray};

    .ant-tabs-nav {
      margin-left: 20px;
      margin-bottom: 0;
      width: max-content;
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
  }
  
  .ant-tabs, .ant-tabs-content, .ant-tabs-tabpane-active {
    height: 100%;
  }
`;

export const ChatTableS = styled.div`
  height: 100%;

  .filter-table {
    height: 100%;
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

      &.button-message {
        &:disabled {
          svg path {
            stroke: ${theme.colors.lightGray};
          }
        }
        &:not(:disabled) {
          svg path {
            fill: ${theme.colors.white};
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

    .button-delete {
      &:hover {
        svg path {
          fill: ${theme.colors.coralPink};
          stroke: unset;
        }
      }
    }
  }
`;

export const WrapFilterTable = styled.div`
  padding-top: 1rem;
  height: calc(100% - ${theme.dimensions.headerTable});

  .filter {
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
  width: 100%;
  overflow: auto;
  height: calc(100% - 24px);

  .table {
    min-width: 800px;
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
