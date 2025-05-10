import styled from "@emotion/styled";
import { theme } from "~/styles/theme";

export const OperatorCardS = styled.div`
  .card-item {
    box-shadow: 0px 2px 8px 0px ${theme.colors.semiTransparentBlack};
    background: ${theme.colors.white};
    height: 100%;

    .ant-card-body {
      padding: 12px;
    }

    .card-title {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      gap: 8px;

      font-size: ${theme.fontSize.medium};
      font-weight: ${theme.fontWeight.normal};
      line-height: 22px;
      color: ${theme.colors.semiBlack};
    }

    .card-description {
      padding-bottom: 4rem;
      color: ${theme.colors.transparentSemiBlack};
    }

    .card-buttons {
      margin-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 8px;

      .card-button-item {
        display: flex;
        align-items: center;
        gap: 8px;

        button {
          color: ${theme.colors.transparentSemiBlack};
          border: 1px solid ${theme.colors.transparentSemiBlack};
        }

        span {
          font-size: 12px;
          font-weight: 400;
          line-height: 20px;
          color: ${theme.colors.transparentSemiBlack};
        }
      }
    }

    &:hover {
      background: ${theme.colors.lightIceBlue};

      .card-title {
        color: ${theme.colors.vividBlue};
      }
    }
  }


  @media only screen and (max-width: 749px) {
    .card-item {
      width: 260px;
    }
  }
`;
