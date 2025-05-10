import styled from "@emotion/styled";

import Row from "app/components/atoms/Row";
import Spin from "app/components/atoms/Spin";

export interface Props {
	spinnerSize?: "small" | "large" | "default";
	minHeight?: string;
}

const Loading: React.FC<Props> = ({ spinnerSize, minHeight }) => {
	return (
		<StyledRow justify="center" align="middle" minHeight={minHeight}>
			<Spin tip="ローディング中" size={spinnerSize} />
		</StyledRow>
	);
};

const StyledRow = styled(Row)<{ minHeight?: string }>`
  min-height: ${({ minHeight }) => minHeight};
`;

export default Loading;
