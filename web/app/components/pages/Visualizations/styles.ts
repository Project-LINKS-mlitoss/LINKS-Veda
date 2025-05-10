import styled from "@emotion/styled";
import Card from "app/components/atoms/Card";
import Radio from "app/components/atoms/Radio";
import { theme } from "~/styles/theme";

export const VisualizationHeadingContainer = styled.div`
  display: flex;
  height: 72px;
  padding: var(--Icon-normal, 16px) 24px;
  justify-content: center;
  align-items: center;
  align-self: stretch;
  border-radius: var(--Spacing-micro, 2px);
  background: var(--Neutral-1, #fff);
`;
export const VisualizationHeadingWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1 0 0;
  padding: var(--Radius-normal, 6px) 0px;

  h1 {
    color: var(--character-title-85, rgba(0, 0, 0, 0.85));
    /* H4/medium */
    font-family: Roboto;
    font-size: 20px;
    font-style: normal;
    font-weight: 500;
    line-height: 28px; /* 140% */
  }
  svg {
    width: 24px;
    height: 24px;
  }
`;
export const VisualizationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 48px;
  flex: 1 0 0;
  align-self: stretch;
  .rotate-path {
    margin: auto;
    text-align: center;
  }
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
`;

export const DataSetTableWrapper = styled.div`
  display: flex;
  width: 480px;
  padding: 0px 10px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 10px;
  margin: auto;
  .ant-table-wrapper {
    max-height: 460px;
    overflow-y: scroll;
    overflow-x: hidden;
    max-width: none;
  }
  h2 {
    color: var(--character-secondary-45, rgba(0, 0, 0, 0.45));
    font-family: Roboto;
    font-size: 12px;
    font-style: normal;
    font-weight: 700;
    line-height: 20px; /* 166.667% */
  }
  .ant-table-cell-row-hover,
  .selected-row {
    background: #e6f7ff !important;
    color: #1890ff !important;
  }
  .ant-table-cell {
    min-width: 153px;
    padding: 16px;
  }
  .filter {
    display: flex;
    display: flex;
    align-items: center;
    padding-left: 1.25rem;
    padding-right: 1.25rem;

    .input-search {
      height: 24px;
      width: 148px;
      border-radius: 0px;
    }

    .button-search {
      background-color: ${theme.colors.white};
      border: 1px solid ${theme.colors.lightGray};
      border-left: unset;
      padding: 0px 5px 0px 5px;
      height: 24px;
  }

  .table-header {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
  }

  .selection-count {
    color: ${theme.colors.vividBlue};
    font-size: 12px;
    font-weight: 500;
  }
`;
export const VisualizationFooterContainer = styled.div`
  display: flex;
  width: 100%;
  padding: 12px var(--Icon-normal, 16px);
  justify-content: flex-end;
  align-items: flex-start;
  gap: 10px;
  border-top: 1px solid var(--Conditional-divider, rgba(0, 0, 0, 0.06));
  background: var(--Neutral-1, #fff);
  .primary {
    display: flex;
    padding: 4px 15px;
    justify-content: center;
    align-items: center;
    gap: var(--Spacing-small, 8px);
    border-radius: var(--Spacing-micro, 2px);
    border: 1px solid var(--Primary-6, #1890ff);
    background: var(--Primary-6, #1890ff);
    box-shadow: 0px 2px 0px 0px rgba(0, 0, 0, 0.04);
  }
  .secondary {
    display: flex;
    padding: 4px 15px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    border-radius: var(--Spacing-micro, 2px);
    border: 1px solid var(--Neutral-5, #d9d9d9);
    background: var(--Neutral-1, #fff);
    box-shadow: 0px 2px 0px 0px rgba(0, 0, 0, 0.02);
  }
`;
export const VisualizationPageContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1 0 0;
  align-self: stretch;
  flex-direction: column;
  min-height: calc(100vh - 50px);
`;
export const VisualizationPageContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const UseCaseContainer = styled.div`
  gap: 8px;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
`;

export const VisualizationCard = styled(Card)`
  border: 1px solid var(--Neutral-5, #d9d9d9);
  width: 224px;
  height: 112px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: color 0.3s ease;

  &:hover {
    color: var(--Primary-6, #1890ff);
  }
`;

export const CardUseCase = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const CardLabel = styled.div`
  width: 100%;
  text-align: center;
`;

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: start;
  gap: 1.25rem;
`;

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: calc(100vh - 130px);
  padding: 1rem;

  @media (max-width: 768px) {
    min-height: calc(100vh - 120px);
  }
`;

export const PageTitle = styled.h1`
  font-size: 1.125rem;
  font-weight: normal;
`;

export const StyledRadioGroup = styled(Radio.Group)`
  width: 100%;
  display: flex;
  gap: 1rem;

  .ant-radio {
    display: none;
  }
`;

export const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;

  .maplibregl-control-container {
    display: none;
  }
`;
