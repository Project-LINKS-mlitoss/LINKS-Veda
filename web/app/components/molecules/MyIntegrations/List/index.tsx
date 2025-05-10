import styled from "@emotion/styled";

import PageHeader from "app/components/atoms/PageHeader";
import MyIntegrationCard from "app/components/molecules/MyIntegrations/List/Card";
import IntegrationCreationAction from "app/components/molecules/MyIntegrations/List/CreationAction";
import type { Integration } from "app/components/molecules/MyIntegrations/types";

interface Props {
	integrations?: Integration[];
	onIntegrationModalOpen: () => void;
	onIntegrationNavigate: (integration: Integration) => void;
}

const MyIntegrationList: React.FC<Props> = ({
	integrations,
	onIntegrationModalOpen,
	onIntegrationNavigate,
}) => {
	return (
		<Wrapper>
			<PageHeader title="マイインテグレーション" />
			<ListWrapper>
				{integrations?.map((integration: Integration) => (
					<MyIntegrationCard
						key={integration.id}
						integration={integration}
						onIntegrationNavigate={onIntegrationNavigate}
					/>
				))}
				<IntegrationCreationAction
					onIntegrationModalOpen={onIntegrationModalOpen}
				/>
			</ListWrapper>
		</Wrapper>
	);
};

const Wrapper = styled.div`
  min-height: calc(100% - 16px);
  background: #fff;
  margin: 16px 16px 0;
`;

const ListWrapper = styled.div`
  border-top: 1px solid #f0f0f0;
  padding: 12px;
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
`;

export default MyIntegrationList;
