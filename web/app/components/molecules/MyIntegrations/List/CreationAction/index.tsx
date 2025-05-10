import styled from "@emotion/styled";

import Icon from "app/components/atoms/Icon";

export interface Props {
	onIntegrationModalOpen: () => void;
}

const IntegrationCreationAction: React.FC<Props> = ({
	onIntegrationModalOpen,
}) => {
	return (
		<CardWrapper>
			<Card onClick={onIntegrationModalOpen}>
				<StyledIcon icon="plus" />
				<CardTitle>新規インテグレーション作成</CardTitle>
			</Card>
		</CardWrapper>
	);
};

const CardWrapper = styled.div`
  padding: 12px;
`;

const StyledIcon = styled(Icon)`
  font-size: 36px;
`;

const Card = styled.div`
  justify-content: center;
  height: 180px;
  width: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  border: 1px solid #f0f0f0;
  box-shadow: 0px 2px 8px #00000026;
  border-radius: 4px;
  color: #00000073;
  cursor: pointer;
  &:hover {
    color: #1890ff;
    background-color: #e6f7ff;
  }
`;

const CardTitle = styled.p`
  margin-top: 8px;
  font-weight: 500;
  font-size: 14px;
  line-height: 22px;
`;

export default IntegrationCreationAction;
