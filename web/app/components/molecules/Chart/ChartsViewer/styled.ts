import styled from "@emotion/styled";
import { theme } from "~/styles/theme";

export const ChartsWrapper = styled.div`
  background-color: ${theme.colors.white};
  min-height: 250px;
  padding: 0.25rem;
`;
export const Scrollable = styled.div`
  padding: 0.1rem;
  // max-height: 32rem;
`;
export const ChartContainer = styled.div`
  background: white;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s ease;

  &.selected {
    border: 2px solid #1e90ff;
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 16px;
      color: rgba(0, 0, 0, 0.85);
    }

    .delete-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: #999;

      &:hover {
        color: #ff4d4f;
      }
    }
  }

  .chart-content {
    display: flex;
    align-items: flex-start;
  }
`;
