import styled from "@emotion/styled";
import { theme } from "~/styles/theme";

export const WrapContentS = styled.div`
  height: 100%;

  .title {
    display: flex;
    align-items: center;
    background-color: ${theme.colors.white};
    padding: 16px 24px;
    border-bottom: 2px solid ${theme.colors.lightGray};

    a {
      gap: 12px;
      font-size: ${theme.fontSize.xxxLarge};
      line-height: 28px;
      color: ${theme.colors.semiBlack};
      display: flex;
      align-items: center;
    }
  }

  .children {
    height: calc(100% - ${theme.dimensions.headerViewer});
    overflow: auto;
  }
`;

export const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .ant-breadcrumb {
    ol {
      align-items: center;

      .ant-breadcrumb-link, .ant-breadcrumb-separator {
        font-size: ${theme.fontSize.xxxLarge};
        line-height: 28px;
        color: ${theme.colors.semiBlack};
      }
    }
  }

  .actions {
    display: flex;
    gap: 8px;
  }
`;
