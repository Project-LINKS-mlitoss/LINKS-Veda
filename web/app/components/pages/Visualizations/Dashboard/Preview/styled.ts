import styled from "@emotion/styled";
import { theme } from "~/styles/theme";

export const MapContainer = styled.div`
  background-color: ${theme.colors.transparentBlack};
  height: calc(100vh - ${theme.dimensions.headerAndTitleHeight});
  max-width: calc(100vw - 200px);
  overflow: hidden;
  position: relative;
`;

export const VisualizationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  height: 100%;
`;
export const StickyFilters = styled.div`
  position: sticky;
  top: 0;
  left: 0;
  align-self: flex-start;
  width: 320px;
  z-index: 2;
`;

export const StickyCharts = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;
export const StickyTable = styled.div`
  align-items: flex-end;
  margin-right: 8px;
  transition: all 0.3s ease;
`;

export const BottomPanel = styled.div`
  position: fixed;
  bottom: 3rem;
  min-width: 100px;
  right: 1rem;
  z-index: 99;
  display: flex;
  align-items: end;
  justify-content: space-between;
  transition: all 0.3s ease;
`;
