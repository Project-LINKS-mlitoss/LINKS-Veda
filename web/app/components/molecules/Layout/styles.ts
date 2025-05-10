import styled from "@emotion/styled";
import Header from "~/components/atoms/Header";
import { theme } from "~/styles/theme";

export const LayoutS = styled.div`
  overflow: hidden;
  height: 100%;

  .wrap-children {
    overflow: hidden;
    height: 100%;
    padding-top: ${theme.dimensions.headerHeight};
  }
`;

export const MainHeader = styled(Header)`
  display: flex;
  align-items: center;
  height: ${theme.dimensions.headerHeight};
  background-color: ${theme.colors.darkGray};
  gap: 24px;
  padding: 0 20px;
  position: fixed;
  z-index: 1000;
  width: 100vw;

  .logo {
    width: 110px;
    height: auto;
    cursor: pointer;
    background-color: ${theme.colors.white};
    border-radius: ${theme.borderRadius.tiny};

    img {
      object-fit: contain;
    }
  }
`;

export const SkeletonContentS = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;

  .ant-skeleton-content {
    .ant-skeleton-title {
      height: 28px;
    }

    .ant-skeleton-paragraph {
      li {
        height: 60px !important;
        width: 100% !important;
      }
    }
  }
`;
