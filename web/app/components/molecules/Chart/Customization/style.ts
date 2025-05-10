import styled from "@emotion/styled";
import ButtonComponent from "~/components/atoms/Button";
import DividerComponent from "~/components/atoms/Divider";
import InputComponent from "~/components/atoms/Input";
import SelectComponent from "~/components/atoms/Select";
import { theme } from "~/styles/theme";

export const FiltersContainer = styled.div`
  background-color: ${theme.colors.softWhite};
  * {
    border-radius: 0 !important;
  }
`;

export const Scrollable = styled.div`
  padding: 12px 16px;
  max-height: calc(70vh);
  overflow-x: hidden;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  flex: 1 0 0;
  width: 100%;
  label {
    color: rgba(0, 0, 0, 0.85) !important;
    font-family: Roboto;
    font-size: 12px !important;
    font-style: normal;
    font-weight: 400;
    line-height: 20px; /* 166.667% */
    margin: 0;
  }
`;

export const Section = styled.div`
  margin-bottom: 8px;
  .ant-form-item {
    min-width: 0;
  }
`;

export const Label = styled.label`
  display: block;
  font-size: ${theme.fontSize.medium};
  color: ${theme.colors.semiBlack};
  margin-bottom: 0.5rem;
  min-width: 60px;
`;

export const Input = styled(InputComponent)`
  width: 100%;
  margin-bottom: 0.5rem;
`;

export const Select = styled(SelectComponent)`
  width: 100%;
  margin-bottom: 0.5rem;
`;

export const Group = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  gap: 4px;
  .active {
    background-color: ${theme.colors.lightIceBlue};
    color: ${theme.colors.azureBlue};
  }
`;

export const Button = styled(ButtonComponent)`
  flex: 1;
  text-align: center;
`;

export const LinkText = styled.div`
  font-size: ${theme.fontSize.small};
  color: ${theme.colors.transparentGray};
  display: block;
  text-align: right;
  text-decoration: underline;
  cursor: pointer;
`;

export const Actions = styled.div`
  display: flex;
  padding: 12px 16px;
  justify-content: space-between;
  align-items: flex-start;
  align-self: stretch;
`;

export const IconButton = styled(Button)`
  padding: 0;
  font-size: ${theme.fontSize.large};
  border-radius: 50% !important;
`;

export const Divider = styled(DividerComponent)`
  margin: 0.5rem;
`;

export const H2Span = styled.span`
  font-size: ${theme.fontSize.huge};
  margin-bottom: 8px;
`;
