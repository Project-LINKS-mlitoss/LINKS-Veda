import styled from "@emotion/styled";
import { theme } from "~/styles/theme";

export const MapContainer = styled.div`
  height: calc(100vh - ${theme.dimensions.headerAndTitleHeight});
  overflow: hidden;
  position: relative;
`;

export const VisualizationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  height: 100%;
  padding: 16px;
`;

export const ModelSelectionContainer = styled.div`
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  h4 {
    font-family: Roboto;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
  }
`;

export const ModelSelectionRow = styled.div<{ isSelected: boolean }>`
  border: 1px solid
    ${(props) => (props.isSelected ? theme.colors.brightRoyalBlue : "#e6e6e6")};
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  background-color: ${(props) => (props.isSelected ? "#f0f7ff" : "white")};
  .ufn-id {
    color: ${(props) =>
			props.isSelected ? theme.colors.brightRoyalBlue : "#333"};
    font-family: Roboto;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
  }
  .ufn-content {
    color: ${(props) =>
			props.isSelected ? theme.colors.brightRoyalBlue : "#333"};
    font-family: Roboto;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 24px;
  }
  &:hover {
    border-color: ${theme.colors.brightRoyalBlue};
  }
`;

export const SettingSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  button {
    width: 100%;
    padding: 12px;
    border: 1px solid #e6e6e6;
    border-radius: 4px;
    background-color: white;
    cursor: pointer;
    font-size: 14px;
    text-align: left;
    color: #333;
  }
`;
