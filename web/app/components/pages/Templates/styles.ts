import styled from "@emotion/styled";
import Modal from "~/components/atoms/Modal";
import { theme } from "~/styles/theme";

export const TemplateS = styled.div`
  input,
  .ant-select-selector {
    border-radius: unset !important;
  }
`;

export const TemplateLayoutS = styled.div`
  height: calc(100vh - ${theme.dimensions.headerAndTitleHeight});

  .left-item {
    min-width: ${theme.dimensions.minWidthLeftCenterAreaLarge};
    border-right: 2px solid ${theme.colors.lightGray};
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
        border-radius: ${theme.borderRadius.tiny};
        border: 1px solid ${theme.colors.lightGray};
        background: ${theme.colors.white};
      }
    }
  }
`;

export const TemplatesListS = styled.div`
  height: 100%;

  .filter-list {
    padding: 24px;
    height: calc(100% - ${theme.dimensions.headerButtonsBottom});
    overflow: auto;

    .filter {
      display: flex;
      display: flex;
      align-items: center;
      margin-bottom: 24px;

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

    .wrap-list {
      .list {
        margin-bottom: 24px;
      }
    }
  }

  .button-bottom {
    padding: 12px 16px;
    gap: 10px;
    border: 1px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    background: ${theme.colors.white};

    button {
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

export const ListContent = styled.div`
  .list-title-action {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .list-title {
      color: ${theme.colors.semiBlack};
      font-size: 14px;
      font-weight: 400;
      line-height: 22px;
      margin-bottom: 10px;
    }

    .action {
      display: flex;
      align-items: center;
      gap: 12px;

      button {
        font-size: 14px;
        font-weight: 400;
        line-height: 22px;
        text-align: center;
        color: ${theme.colors.vividBlue};

        &:hover {
          color: ${theme.colors.brightRoyalBlue};
        }
      }
    }
  }

  .list-content {
  }
  .temps-all {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .temps {
    display: flex;
    gap: 16px;
    padding: 10px 0;

    .temp {
      /* flex: 1 1 ${theme.dimensions.tempWidth}px; */
      /* min-width: ${theme.dimensions.tempWidth}px; */
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
      &.temp-active {
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


`;

export const TemplatePreviewS = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
  padding: 24px;

  .name {
    font-size: ${theme.fontSize.large};
    font-weight: ${theme.fontWeight.normal};
    line-height: 22px;
    color: ${theme.colors.semiBlack};
    margin-bottom: 24px;
  }
`;

export const TemplateCreateEditS = styled.div`
  height: calc(100vh - ${theme.dimensions.headerAndTitleHeight});
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;

  .left-item,
  .center-item,
  .right-item {
    height: 100%;
    width: 100%;
  }

  .left-item,
  .center-item {
    border-right: 2px solid ${theme.colors.lightGray};
  }

  .left-item {
    overflow: hidden;
  }

  .center-item {
    overflow-y: auto;
  }

  .right-item {
    overflow-x: hidden;
  }
`;

export const SettingOperatorTemplateS = styled.div`
  width: 100%;

  .ant-collapse {
    height: unset;
    display: block;

    .ant-collapse-item {
      border-radius: ${theme.borderRadius.medium};

      .ant-collapse-header {
        background-color: ${theme.colors.white};
        border-radius: ${theme.borderRadius.medium};
        box-shadow: 0px 2px 8px 0px ${theme.colors.semiTransparentBlack};
      }

      .ant-collapse-expand-icon {
        right: 0 !important;
      }

      .ant-collapse-content {
        border: unset;

        .ant-collapse-content-box {
          padding: 10px 0 0 10px;
          background-color: ${theme.colors.softWhite};
        }
      }
    }
  }

  .collapse-child {
    background-color: ${theme.colors.softWhite};

    .ant-collapse-item {
      .ant-collapse-header {
        background-color: ${theme.colors.white} !important;
      }

      .ant-collapse-content {
        .ant-collapse-content-box {
          padding: 10px;
          background-color: ${theme.colors.white} !important;
          border-radius: ${theme.borderRadius.medium};
        }
      }
    }

    .required {
      color: ${theme.colors.fieryRed};
    }
  }

  .panel {
    margin-bottom: 10px;
    background-color: rgba(0, 0, 0, 0.02);
    border-radius: 5px;
    border: unset;

    .panel-header {
      display: grid;
      grid-template-columns: 3fr 8fr 4fr 1fr;
      align-items: center;
      gap: 4px;
    }
  }

  .column-setting {
    display: grid;
    grid-template-columns: 1fr 2fr;
    align-items: center;
    margin-bottom: 10px;
  }

  .collapse-gen-source-name {
    padding: 0 0 0 10px;
  }

  .form {
    .ant-form-item {
      margin-bottom: 10px;

      .ant-form-item-control-input-content {
        gap: 10px;
        display: flex;
        align-items: center;

        .select {
          width: 100px;

          .ant-select-selector {
            width: 100px;
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
        border-radius: ${theme.borderRadius.small};
        border: unset;
        width: 100%;
        max-height: none;
        height: auto;
      }

      .ant-collapse-header {
        background-color: ${theme.colors.white};
        box-shadow: 0px 2px 8px 0px ${theme.colors.semiTransparentBlack};
        border-radius: ${theme.borderRadius.medium};
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
            border-radius: ${theme.borderRadius.tiny};
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
        border-radius: ${theme.borderRadius.medium};

        .ant-collapse-header {
          box-shadow: unset;
          padding: 12px 35px 12px 16px;
        }

        .ant-collapse-content {
          border-radius: ${theme.borderRadius.medium};
          .ant-collapse-content-box {
            padding: 0 32px 16px;
            background-color: unset;
          }
        }
      }

      .panel-text-match-spatial-join {
        .ant-collapse-expand-icon {
          right: 10px !important;
          top: 10px !important;
        }

        .panel-table {
          width: 100%;
          border: 1px solid ${theme.colors.transparentVeryLightBlack};
          margin-bottom: 4px;

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
            display: grid;
            grid-template-columns: 2fr 3fr;
            margin-bottom: 8px;

            .col-key {
              display: flex;
              align-items: center;
              justify-content: flex-start;
            }

            .col-value {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 4px;

              .ant-select {
                width: -webkit-fill-available;

                .ant-select-selector .ant-select-selection-item {
                  text-align: left;
                }
              }

              .ant-input-number {
                width: -webkit-fill-available;
              }
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
                border-radius: ${theme.borderRadius.tiny};

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
          background-color: unset;

          .panel-content-cross-tab {
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
          background-color: unset;

          .wrap-spatial-aggregation-select {
            padding-bottom: 24px;
            margin-bottom: 24px;
            border-bottom: 1px solid ${theme.colors.transparentLightGray};

            .spatial-aggregation-select {
              width: 100%;

              .ant-select-selector {
                border-radius: ${theme.borderRadius.tiny};

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

  &.active-step-workflow {
    .ant-collapse .ant-collapse-item .ant-collapse-header,
    .add-option .coll .panel,
    .add-option .coll .ant-collapse-content,
    .add-option
      .coll
      .panel-child
      .ant-collapse-content
      .ant-collapse-content-box,
    .collapse-child
      .ant-collapse-item
      .ant-collapse-content
      .ant-collapse-content-box {
      background: ${theme.colors.lightIceBlue} !important;
      color: ${theme.colors.vividBlue} !important;
    }

    input,
    .ant-select-selector,
    textarea {
      border: 1px solid ${theme.colors.skyBlue} !important;
      color: ${theme.colors.vividBlue} !important;
    }

    .ant-checkbox-wrapper,
    .column-item-title {
      color: ${theme.colors.vividBlue} !important;
    }
  }
`;

export const TemplateNameS = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 1fr 3fr;
  gap: 10px;
  padding: 12px;

  label {
    font-size: ${theme.fontSize.large};
    font-weight: ${theme.fontWeight.normal};
    line-height: 22px;

    span {
      color: ${theme.colors.fieryRed};
    }
  }

  input {
    border-radius: ${theme.borderRadius.tiny};
  }
`;

export const WorkFlowS = styled.div`
  height: calc(100vh - ${theme.dimensions.headerAndTitleHeight});

  .setting {
    height: 90%;
    display: flex;
    flex-direction: column;
    font-size: ${theme.fontSize.large};
    overflow-y: auto;

    .title-work-flow {
      display: flex;
      align-items: center;
      margin: 24px;
      gap: 10px;

      p {
        min-width: max-content;
        font-size: ${theme.fontSize.large};
        font-weight: ${theme.fontWeight.normal};
        line-height: 22px;

        span {
          color: ${theme.colors.fieryRed};
        }
      }

      .input {
        height: 36px;
        max-width: 618px;
        border-radius: 2px;
      }
    }

    .button-add-template {
      font-size: ${theme.fontSize.large};
      color: ${theme.colors.transparentSemiBlack};
      border: unset;
    }

    .template-data-structure {
      padding: 24px;
      gap: 8px;
      background: ${theme.colors.veryLightGray};
      display: flex;
      align-items: center;
      justify-content: center;

      .ant-collapse {
        .ant-collapse-item {
          .ant-collapse-content {
            background-color: ${theme.colors.veryLightGray};

            .ant-collapse-content-box {
              &:first-child {
                background-color: ${theme.colors.veryLightGray};
              }
            }
          }
        }
      }

      .collapse-child {
        background-color: ${theme.colors.veryLightGray};
      }
    }

    .add-templates {
      padding: 24px;

      .template {
        width: 100%;

        .template-item {
          width: 100%;
          margin-bottom: 30px;
          border-bottom: 1px solid ${theme.colors.lightGray};
        }
      }

      .wrap-button-add-template {
        display: flex;
        align-items: center;
        justify-content: center;
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

export const ModalSelectTemplateS = styled.div`
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
      color: ${theme.colors.vividBlue} !important;

      td {
        background: ${theme.colors.lightIceBlue} !important;
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
      font-size: 14px;
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
