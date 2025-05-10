import styled from "@emotion/styled";

import PageHeader from "app/components/atoms/PageHeader";
import Tabs from "app/components/atoms/Tabs";
import MyIntegrationSettings from "app/components/molecules/MyIntegrations/Settings";
import Webhook from "app/components/molecules/MyIntegrations/Webhook";
import type {
	Integration,
	WebhookTrigger,
	WebhookValues,
} from "app/components/molecules/MyIntegrations/types";

interface Props {
	integration: Integration;
	webhookInitialValues?: WebhookValues;
	updateIntegrationLoading: boolean;
	regenerateLoading: boolean;
	createWebhookLoading: boolean;
	updateWebhookLoading: boolean;
	onIntegrationUpdate: (data: {
		name: string;
		description: string;
		logoUrl: string;
	}) => Promise<void>;
	onIntegrationDelete: () => Promise<void>;
	onRegenerateToken: () => Promise<void>;
	onWebhookCreate: (data: {
		name: string;
		url: string;
		active: boolean;
		trigger: WebhookTrigger;
		secret: string;
	}) => Promise<void>;
	onWebhookDelete: (webhookId: string) => Promise<void>;
	onWebhookUpdate: (data: {
		webhookId: string;
		name: string;
		url: string;
		active: boolean;
		trigger: WebhookTrigger;
		secret?: string;
	}) => Promise<void>;
	onIntegrationHeaderBack: () => void;
	onWebhookSelect: (id: string) => void;
}

const MyIntegrationContent: React.FC<Props> = ({
	integration,
	webhookInitialValues,
	updateIntegrationLoading,
	regenerateLoading,
	createWebhookLoading,
	updateWebhookLoading,
	onIntegrationUpdate,
	onRegenerateToken,
	onWebhookCreate,
	onWebhookDelete,
	onWebhookUpdate,
	onIntegrationHeaderBack,
	onIntegrationDelete,
	onWebhookSelect,
}) => {
	const { TabPane } = Tabs;

	return (
		<MyIntegrationWrapper>
			<PageHeader title={integration.name} onBack={onIntegrationHeaderBack} />
			<MyIntegrationTabs defaultActiveKey="integration">
				<TabPane tab="一般" key="integration">
					<MyIntegrationSettings
						integration={integration}
						updateIntegrationLoading={updateIntegrationLoading}
						regenerateLoading={regenerateLoading}
						onIntegrationUpdate={onIntegrationUpdate}
						onIntegrationDelete={onIntegrationDelete}
						onRegenerateToken={onRegenerateToken}
					/>
				</TabPane>
				<TabPane tab="Webhook" key="webhooks">
					<Webhook
						integration={integration}
						webhookInitialValues={webhookInitialValues}
						createWebhookLoading={createWebhookLoading}
						updateWebhookLoading={updateWebhookLoading}
						onWebhookCreate={onWebhookCreate}
						onWebhookDelete={onWebhookDelete}
						onWebhookUpdate={onWebhookUpdate}
						onWebhookSelect={onWebhookSelect}
					/>
				</TabPane>
			</MyIntegrationTabs>
		</MyIntegrationWrapper>
	);
};

const MyIntegrationWrapper = styled.div`
  min-height: calc(100% - 16px);
  background-color: #fff;
  margin: 16px 16px 0;
`;

const MyIntegrationTabs = styled(Tabs)`
  padding: 0 24px;
`;

export default MyIntegrationContent;
