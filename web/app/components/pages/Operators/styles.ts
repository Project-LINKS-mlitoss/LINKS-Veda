import styled from "@emotion/styled";
import { theme } from "~/styles/theme";

export const OperatorsPageS = styled.div<{ sidebarWidth: number }>`
  height: calc(100vh - ${theme.dimensions.headerAndTitleHeight});
  padding: 1.5rem;
  background-color: ${theme.colors.softWhite};

  .function-top {
    display: grid;
    gap: 32px;
    grid-template-columns: repeat(4, 1fr);
    margin-bottom: 32px;
  }

  .function {
    .function-name {
      font-size: ${theme.fontSize.medium};
      font-weight: ${theme.fontWeight.normal};
      line-height: 22px;
      color: ${theme.colors.semiBlack};
      margin-bottom: 1.25rem;
    }

    .list-card {
      grid-template-columns: repeat(4, 1fr);
      display: grid;
      gap: 32px;
    }
  }

  @media only screen and (max-width: 749px) {
    overflow-x: auto;
    width: ${({ sidebarWidth }) => `calc(100vw - ${sidebarWidth}px - 1.5rem)`};

    .function-top,
    .function .list-card {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      display: flex;
      flex-wrap: nowrap;
    }
  }
`;

export const OperatorViewerS = styled.div<{
	leftWidth?: string;
	centerWidth?: string;
	rightWidth?: string;
}>`
  height: calc(100vh - ${theme.dimensions.headerAndTitleHeight});

  .left-item {
    min-width: ${theme.dimensions.minWidthLeftCenterArea};
  }

  .center-item {
    min-width: ${theme.dimensions.minWidthLeftCenterArea};
    overflow-y: auto;
  }

  .right-item {
    overflow-x: auto;
    min-width: ${theme.dimensions.minWidthRightArea};
  }

  .left-item,
  .center-item {
    border-right: 2px solid ${theme.colors.lightGray};
  }
`;

export const InputOperatorS = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  &.setting-tab {
    height: 500px;

    .leaflet-container {
      border-radius: 4px 4px 0 0;
    }
  }

  .selected-file {
    height: 26%;
    .choose-input {
      padding: 12px;
      gap: 5px;
      display: flex;
      align-items: center;
      justify-content: flex-end;

      button {
        height: 32px;
        border-radius: ${theme.borderRadius.tiny};
      }
    }

    .file-selected {
      padding: 12px;
      width: 100%;

      .selected-row {
        background: ${theme.colors.lightIceBlue} !important;
        color: ${theme.colors.vividBlue} !important;

        td {
          background: ${theme.colors.lightIceBlue} !important;
          color: ${theme.colors.vividBlue} !important;
          word-break: break-all;
        }
      }
    }
  }

  .choose-content-spatial-join {
    height: 20%;

    .choose-input {
      display: flex;
      align-items: center;
      justify-content: space-between;

      span {
        font-size: ${theme.fontSize.large};
        font-weight: ${theme.fontWeight.normal};
        line-height: 22px;
        color: #1e1e1e;
      }
    }

    .file-selected {
      .panel-table {
        width: 100%;
        border: 1px solid ${theme.colors.transparentVeryLightBlack};
        tr th {
          font-size: ${theme.fontSize.medium};
          font-weight: ${theme.fontWeight.normal};
          line-height: 20px;
          color: ${theme.colors.transparentSemiBlack};
        }
        tr th,
        td {
          padding: 8px;
          background: ${theme.colors.white};
        }

        .ant-table-cell {
          white-space: normal;
          word-wrap: break-word;
        }

        .title-content {
          span {
            &:first-child {
              margin-right: 4px;
            }
          }
        }
      }
    }
  }

  .viewer {
    height: 74%;
    flex-grow: 1;

    .viewer-content {
      height: 100%;

      .h-100 {
        height: 100%;
      }

      .h-40 {
        height: 40%;
      }

      .h-50 {
        height: 50%;
      }

      .h-60 {
        height: 60%;
      }

      .b-bottom {
        border-bottom: 2px solid ${theme.colors.lightGray};
      }
    }
  }
`;

export const ModalChooseFile = styled.div`
  margin: 24px 0;

  .workflow-operator {
    .wrap-workflow-operator-item {
      width: 100%;
      overflow-x: auto;
      margin-bottom: 10px;
      mask-image: linear-gradient(90deg, ${theme.colors.white} 50%, ${theme.colors.transparentWhite} 110%);
      -webkit-mask-image: linear-gradient(90deg, ${theme.colors.white} 50%, ${theme.colors.transparentWhite} 110%);
      scrollbar-width: thin;
      scrollbar-color: ${theme.colors.transparentBlackLight} transparent;
      
      &::-webkit-scrollbar {
        height: 3px; 
      }
      &::-webkit-scrollbar-track {
        background: transparent; 
      }
      &::-webkit-scrollbar-thumb {
        background: ${theme.colors.transparentBlackLight};
        border-radius: 2px;
      }

      .workflow-operator-item {
        display: flex;
        align-items: center;
        gap: 8px;
        width: max-content;
    
        .filter-item {
          height: 30px;
          border-radius: 2px;
          padding: 4px 11px;
          border: 1px solid ${theme.colors.transparentSemiBlack};
          cursor: pointer;
      
          font-weight: 500;
          font-size: 14px;
          line-height: 22px;
          text-align: center;
          color: ${theme.colors.transparentSemiBlack};
        
          &:hover {
            border: 1px solid ${theme.colors.vividBlue};
          }
        }

        .active-filter-item {
          border: 1px solid ${theme.colors.vividBlue};
          color: ${theme.colors.vividBlue};
        }
      }
    }
    .operator {
    }
  }

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
      color: ${theme.colors.vividBlue} !important;

      td {
        background: ${theme.colors.lightIceBlue} !important;
        color: ${theme.colors.vividBlue} !important;
      }
    }
  }

  .modal-detail-content {
    .title {
      font-size: ${theme.fontSize.medium};
      font-weight: ${theme.fontWeight.normal};
      line-height: 24px;
    }

    .text {
      font-size: ${theme.fontSize.xLarge};
      font-weight: ${theme.fontWeight.medium};
      line-height: 24px;
      color: ${theme.colors.semiBlack};
      margin-bottom: 14px;
    }

    .table-detail {
      border: 1px solid ${theme.colors.mediumGray};
      margin-bottom: 14px;

      .viewer {
        height: 100%;

        &.viewer-geojson {
          height: 600px;
        }

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

      .ant-table-wrapper .ant-table-container {
        border-radius: unset;

        table tr th {
          border-radius: unset;
        }
      }
    }
  }
`;

export const OutputOperatorS = styled.div`
  height: 100%;

  .wrap-processing-generate {
    height: 100%;
    display: flex;
    padding-top: 12px;
    justify-content: center;

    .processing-generate {
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

      .process {
        margin-bottom: 70px;
      }

      .data-structure {
        font-size: ${theme.fontSize.large};
        font-weight: ${theme.fontWeight.normal};
        line-height: 22px;
        color: ${theme.colors.semiBlack};
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

      .pre-processing {
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

      .note {
        margin-top: 24px;
        font-size: ${theme.fontSize.large};
        font-weight: ${theme.fontWeight.normal};
        line-height: 22px;
        color: ${theme.colors.transparentSemiBlack};

        a {
          color: ${theme.colors.vividBlue};
        }
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
  }
`;

export const SettingOperatorS = styled.div`
  height: 100%;

  .ant-tabs {
    height: calc(100% - 60px);

    .ant-tabs-nav {
      margin: 0;

      .ant-tabs-nav-wrap {
        padding: 8px 16px 0px 16px !important;

        .ant-tabs-nav-list {
          gap: 10px;
        }
      }
    }

    .ant-tabs-content-holder {
      .ant-tabs-content {
        height: 100%;

        .ant-tabs-tabpane {
          height: 100%;
        }
      }
    }
  }

  .tab-setting {
    height: 100%;
    padding: 24px;
    background-color: ${theme.colors.white};
    overflow-y: auto;

    .step {
      margin-bottom: 20px;

      .button-suggest {
        display: flex;
        align-items: center;
        justify-content: center;

        button {
          font-weight: ${theme.fontWeight.bold};
          font-size: ${theme.fontSize.large};
          line-height: 22px;
        }
      }

      .step-name {
        font-size: ${theme.fontSize.medium};
        font-weight: ${theme.fontWeight.normal};
        line-height: 22px;
        color: ${theme.colors.semiBlack};
        margin-bottom: 20px;

        span {
          color: ${theme.colors.fieryRed};
        }
      }

      .button-template {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        margin: 20px 0 30px;

        button {
          flex: 1;

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

      .add-column {
        .ant-collapse-header {
          background-color: ${theme.colors.white};

          .ant-collapse-header-text {
            width: 100%;
          }
        }

        .ant-collapse-expand-icon {
          right: 0 !important;
        }

        .ant-collapse {
          height: unset;
          display: block;
        }

        .panel {
          margin-bottom: 10px;
          background-color: rgba(0, 0, 0, 0.02);
          border-radius: 5px;
          border: unset;
          width: 100%;

          .panel-header {
            display: flex;
            align-items: center;
            gap: 4px;
            width: 100%;
          }
          .panel-header > *:nth-child(1) {
            width: 5%;
          }
          .panel-header > *:nth-child(2) {
            width: 15%;
          }
          .panel-header > *:nth-child(3) {
            width: 40%;
          }
          .panel-header > *:nth-child(4) {
            width: 30%;
          }
          .panel-header > *:nth-child(5) {
            width: 10%;
          }
        }

        .column-setting {
          display: grid;
          grid-template-columns: 1fr 2fr;
          align-items: center;
          margin-bottom: 10px;

          .ant-select-selector {
            .ant-select-selection-item {
              text-align: left;
            }
          }
        }
      }

      .add-context {
        .form {
          .form-item {
            margin-bottom: 10px;
            gap: 10px;
            display: flex;
            align-items: center;

            .select {
              width: 200px;

              .ant-select-selector {
                width: 200px;
              }
            }
          }
        }
      }

      .add-option {
        .coll {
          background-color: unset;
          border: unset;
          margin: 0px;
          width: 100%;
          padding: 0;
          max-height: none;
          height: auto;
          display: block;

          .panel {
            margin-bottom: 10px;
            background-color: rgba(0, 0, 0, 0.02);
            border-radius: 5px;
            border: unset;
            width: 100%;
            max-height: none;
            height: auto;
          }

          .ant-collapse-header {
            background-color: ${theme.colors.white};
            box-shadow: 0px 2px 8px 0px ${theme.colors.semiTransparentBlack};
            border-radius: 8px;
            padding: 12px 35px 12px 16px;

            .header-panel {
              display: flex;
              align-items: center;
              justify-content: flex-start;
              gap: 4px;
            }

            .header-panel-key-value {
              margin-top: 10px;
              display: grid;
              grid-template-columns: 2fr 3fr;

              p {
                margin-bottom: 0;
                padding-left: 16px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: flex-start;

                &:last-child {
                  border: 1px solid ${theme.colors.lightGray};
                  border-radius: ${theme.borderRadius.tiny};
                }
              }

              .ant-select-selection-item {
                text-align: left;
              }
            }
          }

          .ant-collapse-content {
            border-top: unset;

            .ant-collapse-content-box {
              padding: 16px 0 16px 16px;
            }
          }

          .ant-collapse-expand-icon {
            right: 10px !important;
          }

          .panel-header-item {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .panel-header-side {
              display: flex;
              align-items: center;
              gap: 4px;

              .ant-select-selector {
                border-radius: 2px;
                min-width: 150px;

                .ant-select-selection-item {
                  text-align: left;
                }
              }

              .required {
                color: ${theme.colors.fieryRed};
              }
            }
          }

          .panel-child {
            background-color: ${theme.colors.white};
            box-shadow: 0px 2px 8px 0px #00000026;
            border-radius: 8px;

            .ant-collapse-header {
              box-shadow: unset;
              padding: 12px 35px 12px 16px;
            }

            .ant-collapse-content {
              border-radius: 8px;
              .ant-collapse-content-box {
                padding: 0 32px 16px;
              }
            }
          }

          .panel-text-match-spatial-join {
            .ant-collapse-expand-icon {
              right: 10px !important;
              top: 10px !important;
            }

            .panel-table {
              margin-bottom: 4px;
              width: 100%;
              border: 1px solid ${theme.colors.transparentVeryLightBlack};
              tr th {
                font-size: ${theme.fontSize.medium};
                font-weight: ${theme.fontWeight.normal};
                line-height: 20px;
                color: ${theme.colors.transparentSemiBlack};
              }
              tr th,
              td {
                padding: 8px;
                background: ${theme.colors.white};
              }

              .ant-table-cell {
                white-space: normal;
                word-wrap: break-word;
              }

              .title-content {
                span {
                  &:first-child {
                    margin-right: 4px;
                  }
                }
              }
            }

            .change-content {
              display: flex;
              justify-content: flex-end;
              margin-top: 4px;

              button {
                text-decoration: underline;
                font-size: ${theme.fontSize.medium};
                font-weight: ${theme.fontWeight.normal};
                line-height: 20px;
                color: ${theme.colors.transparentSemiBlack};
              }
            }

            .cols {
              margin-top: 16px;

              .col {
                display: flex;
                align-items: center;
                margin-bottom: 8px;

                .col-key {
                  display: flex;
                  align-items: center;
                  justify-content: flex-start;
                  width: 30%;
                }

                .col-value {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  gap: 4px;
                  width: 70%;

                  .ant-input-number {
                    width: -webkit-fill-available;
                  }
                }

                .notification-empty {
                  font-size: ${theme.fontSize.large};
                  font-weight: ${theme.fontWeight.normal};
                  line-height: 20px;
                  color: ${theme.colors.semiTransparentBlack};
                  word-wrap: break-word;
                  overflow-wrap: break-word;
                  white-space: normal;
                }
              }
            }
          }

          .panel-cross-tab {
            box-shadow: 0px 2px 8px 0px ${theme.colors.semiTransparentBlack};
            background-color: ${theme.colors.white};

            .ant-collapse-header {
              box-shadow: unset;
              padding: 12px 16px;

              .header-panel-cross-tab {
                padding: 0 16px;
                width: 100%;

                .header-panel-cross-tab-select {
                  width: 100%;
                  margin-top: 10px;

                  .ant-select-selector {
                    border-radius: 2px;

                    .ant-select-selection-item {
                      text-align: left;
                    }
                  }
                }
              }
            }

            .ant-collapse-expand-icon {
              right: 10px !important;
              top: 10px !important;
            }

            .ant-collapse-content-box {
              border-top: 1px solid ${theme.colors.transparentLightGray};
              margin: 12px 32px 16px 32px;
              padding: unset;
              padding: 24px 0 16px;

              .panel-content-cross-tab {
                .ant-select {
                  width: -webkit-fill-available;

                  .ant-select-selector .ant-select-selection-item {
                    text-align: left;
                  }
                }

                .button-add-col {
                  color: ${theme.colors.transparentGray};
                  font-weight: ${theme.fontWeight.bold};
                  border: unset;
                  width: 100%;
                  margin-bottom: 8px;
                  box-shadow: unset;
                }
              }
            }
          }

          .panel-spatial-aggregation {
            box-shadow: 0px 2px 8px 0px ${theme.colors.semiTransparentBlack};
            background-color: ${theme.colors.white};

            .ant-collapse-header {
              box-shadow: unset;
              padding: 12px 16px;
            }

            .ant-collapse-expand-icon {
              right: 10px !important;
              top: 10px !important;
            }

            .ant-collapse-content-box {
              margin: 0 32px 16px;
              padding: unset;
              padding: 24px 0 16px;

              .wrap-spatial-aggregation-select {
                padding-bottom: 24px;
                margin-bottom: 24px;
                border-bottom: 1px solid ${theme.colors.transparentLightGray};

                .spatial-aggregation-select {
                  width: 100%;

                  .ant-select-selector {
                    border-radius: 2px;

                    .ant-select-selection-item {
                      text-align: left;
                    }
                  }
                }
              }

              .panel-content-spatial-aggregation {
                .button-add-col {
                  color: ${theme.colors.transparentGray};
                  font-weight: ${theme.fontWeight.bold};
                  border: unset;
                  width: 100%;
                  margin-bottom: 8px;
                  box-shadow: unset;
                }
              }
            }
          }
        }
      }
    }
  }

  .button-bottom {
    padding: 12px 16px;
    gap: 10px;
    border: 1px 0px 0px 0px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    background: ${theme.colors.white};
    border-top: 1px solid ${theme.colors.transparentVeryLightBlack};

    .button-bottom-in {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 10px;
    }

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

  .ant-collapse-item {
    position: relative;
    .ant-collapse-expand-icon {
      right: 12%;
      top: 28%;
      position: absolute;
    }
  }

  .ant-select {
    width: -webkit-fill-available;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    .ant-select-selector {
      display: flex;
      align-items: center;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      .ant-select-selection-item {
        display: inline-block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
        text-align: left;
      }
    }
  }
`;

export const ColumnItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;

  .column-item-title {
    width: 30%;
    font-size: ${theme.fontSize.large};
    font-weight: ${theme.fontWeight.normal};
    line-height: 22px;
    text-align: left;
    color: ${theme.colors.semiBlack};
  }

  .column-item-content {
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: 4px;
    width: 70%;

    input,
    .ant-select {
      width: 100%;
    }
    input,
    .ant-select-selector {
      border-radius: ${theme.borderRadius.tiny};
    }

    .column-item-target-content {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 10px;
      width: 100%;

      .ant-checkbox-wrapper {
        display: flex;
        align-items: center;
        span {
          padding-right: 0;
        }
      }
    }
  }
`;

export const TableChooseContent = styled.div`
  margin-bottom: 24px;

  .panel-table {
    width: 100%;
    border: 1px solid ${theme.colors.transparentVeryLightBlack};
    margin-bottom: 10px;

    tr th {
      font-size: ${theme.fontSize.medium};
      font-weight: ${theme.fontWeight.normal};
      line-height: 20px;
      color: ${theme.colors.transparentSemiBlack};
    }
    tr th,
    td {
      padding: 8px;
      background: ${theme.colors.white};
    }

    .ant-table-cell {
      white-space: normal;
      word-wrap: break-word;
    }

    .title-content {
      span {
        &:first-child {
          margin-right: 4px;
        }
      }
    }
  }

  .change-content {
    display: flex;
    justify-content: flex-end;
    margin-top: 4px;

    button {
      text-decoration: underline;
      font-size: ${theme.fontSize.medium};
      font-weight: ${theme.fontWeight.normal};
      line-height: 20px;
      color: ${theme.colors.transparentSemiBlack};
    }
  }
`;

export const ModalGenerate = styled.div`
  margin: 24px 0;

  p {
    font-size: ${theme.fontSize.medium};
    font-weight: ${theme.fontWeight.normal};
    line-height: 22px;
    color: ${theme.colors.semiBlack};
  }
`;

export const ContentViewerS = styled.div`
  height: 100%;
  width: 100%;
  position: relative;

  .content-viewer-table {
    height: 85%;
    background-color: white;
    overflow: hidden auto;
    position: relative;

    .confident-high {
      background-color: ${theme.colors.white};
    }

    .confident-medium-high {
      background-color: ${theme.colors.lightCoralRed};
    }

    .confident-medium {
      background-color: ${theme.colors.coralPink};
    }

    .confident-low {
      background-color: ${theme.colors.brightRed};
      color: ${theme.colors.white};
    }

    div {
      height: 100%;
    }
    .ant-table-content {
      overflow: auto !important;
    }

    .ant-table-thead > tr > th {
      .title-col {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    .icon-column {
      background: ${theme.colors.softWhite};
    }

    .ant-table-tbody {
      .ant-table-row {
        .ant-table-cell {
          white-space: nowrap;
          padding: 8px;

          .col-name {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }
    }

    .confident-note {
      position: absolute;
      left: 20px;
      bottom: 20px;
      width: 100%;
      height: unset;

      p {
        font-size: ${theme.fontSize.large};
        font-weight: ${theme.fontWeight.normal};
        line-height: 22px;
        margin: 0;
        color: ${theme.colors.semiBlack};

        display: flex;
        align-items: center;
        gap: 12px;

        span {
          display: flex;
          align-items: center;
          .circle {
            width: 14px;
            height: 14px;
            display: inline-block;
            margin-right: 5px;
            border-radius: 50%;
            border: 1px solid ${theme.colors.transparentSemiBlack};
          }
        }
      }
    }

    .selected-row {
      background-color: ${theme.colors.lightIceBlue} !important;
      color: ${theme.colors.vividBlue} !important;

      td {
        background-color: ${theme.colors.lightIceBlue} !important;
      }
    }
  }

  .wrap-pagination {
    width: 100%;
    height: 15%;
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

  .title {
    font-size: ${theme.fontSize.large};
    font-weight: ${theme.fontWeight.normal};
    line-height: 22px;
    color: ${theme.colors.black};
    margin-bottom: 10px;
  }
  .required {
    font-size: ${theme.fontSize.large};
    font-weight: ${theme.fontWeight.normal};
    line-height: 22px;
    color: ${theme.colors.fieryRed};
  }

  .option {
    display: flex;
    flex-wrap: wrap;
    max-width: 100%;
    gap: 10px;
    margin-bottom: 20px;

    button {
      flex: 0 48%;
      box-sizing: border-box;
      height: 40px;
      border-radius: 2px;
    }
  }

  .back {
    display: flex;
    justify-content: flex-end;
    font-size: 12px;
    font-weight: ${theme.fontWeight.normal};
    line-height: 22px;
    color: ${theme.colors.transparentSemiBlack};
    margin-bottom: 0;
    cursor: pointer;
  }

  .modal-item {
    .question {
      font-size: ${theme.fontSize.large};
      font-weight: ${theme.fontWeight.normal};
      line-height: 22px;
      color: ${theme.colors.semiBlack};
      margin-bottom: 16px;
    }
  }

  .form-edit-name {
    .buttons {
      margin-top: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: flex-end;
    }

    .notification {
      font-size: ${theme.fontSize.large};
      font-weight: ${theme.fontWeight.normal};
      line-height: 22px;
      color: ${theme.colors.semiBlack};
      margin-top: 16px;
    }
  }
`;

export const OptionsPreProcessingS = styled.div`
  .ant-checkbox-input,
  .ant-input,
  .ant-select-selector {
    border-radius: 2px;
  }

  p {
    margin-bottom: 0;
  }

  .option-type {
    .line {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }
    }
    .line-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;

      .ant-select {
        width: 100%;
      }

      p {
        display: flex;
        justify-content: flex-start;
      }
    }
    .line-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }

  .normalize {
    .ant-select {
      width: 100%;
    }
  }
`;

export const OperatorsErrorDetail = styled.div`
  margin-bottom: 5px;
`;

export const HistoryS = styled.div<{ isShowData: boolean; isFailed: boolean }>`
  padding: 12px;
  height: 100%;
  overflow-y: auto;

  .crossbar {
    padding: 8px 8px 8px 24px;
    gap: 8px;
    border-radius: 6px;
    box-shadow: 0px 2px 8px 0px #00000026;
    margin-bottom: 10px;
    background-color: ${theme.colors.white};

    font-size: ${theme.fontSize.large};
    font-weight: ${theme.fontWeight.normal};
    line-height: 22px;

    display: flex;
    align-items: center;
    justify-content: space-between;
    color: ${theme.colors.semiBlack};
  }

  .title {
    background-color: ${({ isFailed, isShowData }) =>
			isFailed
				? "${theme.colors.lightCoralRed}"
				: isShowData
					? theme.colors.lightIceBlue
					: "${theme.colors.white};"} !important;

    .status {
      color: ${({ isFailed, isShowData }) =>
				isFailed
					? "${theme.colors.brightRed}"
					: isShowData
						? theme.colors.vividBlue
						: "${theme.colors.semiBlack}"} !important;
    }
  }

  .columns {
    margin-left: 24px;

    .column {
      padding: 8px;
      border-radius: 6px;
      background-color: ${theme.colors.white};

      .name {
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        line-clamp: 1;
        -webkit-box-orient: vertical;
      }

      &.confident-100 {
        background-color: ${theme.colors.white};
      }
      &.confident-70-99 {
        background-color: ${theme.colors.lightCoralRed};
      }
      &.confident-40-69 {
        background-color: ${theme.colors.coralPink};
      }
      &.confident-0-39 {
        background-color: ${theme.colors.brightRed};

        .name,
        .percent {
          color: ${theme.colors.white};
        }
      }
    }
  }
`;

export const ModalWorkflowDetailS = styled.div`
  margin: 24px 0 0;

  .title {
    font-size: ${theme.fontSize.xLarge};
    font-weight: ${theme.fontWeight.bold};
    line-height: 24px;
    color: ${theme.colors.black};
    margin-bottom: 10px;
  }

  .workflow-list {
    max-height: 500px;
    overflow-y: auto;
    background: ${theme.colors.softWhite};
    padding: 24px;
    border: 1px solid ${theme.colors.mediumGray};
  }
`;

export const OutputContentName = styled.div`
  border-radius: 2px;
  background: ${theme.colors.white};
  border: 1px solid ${theme.colors.lightGray};
  padding: 5px 12px;

  font-size: 14px;
  font-weight: 400;
  line-height: 22px;

  display: inline-block;
  width: 297px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 0;
`;
