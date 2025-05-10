import styled from "@emotion/styled";

import Button from "app/components/atoms/Button";
import Icon from "app/components/atoms/Icon";
import type {
	Webhook,
	WebhookTrigger,
} from "app/components/molecules/MyIntegrations/types";

import WebhookCard from "./WebhookCard";

interface Props {
	webhooks?: Webhook[];
	onWebhookDelete: (webhookId: string) => Promise<void>;
	onWebhookUpdate: (data: {
		webhookId: string;
		name: string;
		url: string;
		active: boolean;
		trigger: WebhookTrigger;
	}) => Promise<void>;
	onShowForm: () => void;
	onWebhookSelect: (id: string) => void;
}

const WebhookList: React.FC<Props> = ({
	webhooks,
	onWebhookDelete,
	onWebhookUpdate,
	onShowForm,
	onWebhookSelect,
}) => {
	return (
		<>
			<ActionWrapper>
				<Button onClick={onShowForm} type="primary" icon={<Icon icon="plus" />}>
					新しいWebhook
				</Button>
			</ActionWrapper>
			{webhooks && webhooks.length > 0 ? (
				<ListWrapper>
					{webhooks.map((webhook) => (
						<WebhookCard
							key={webhook.id}
							webhook={webhook}
							onWebhookDelete={onWebhookDelete}
							onWebhookUpdate={onWebhookUpdate}
							onWebhookSettings={onWebhookSelect}
						/>
					))}
				</ListWrapper>
			) : (
				<EmptyListWrapper>
					<Title>Webhookはまだありません</Title>
					<Suggestion>
						<Text>新規作成</Text>
						<Button
							onClick={onShowForm}
							type="primary"
							icon={<Icon icon="plus" />}
						>
							"新しい Webhook"
						</Button>
					</Suggestion>
					<Suggestion>
						{/* biome-ignore lint/a11y/useValidAnchor: FIXME */}
						読む <a href="">CMSの使い方</a> はじめに
					</Suggestion>
				</EmptyListWrapper>
			)}
		</>
	);
};

const ActionWrapper = styled.div`
  text-align: right;
`;

const Suggestion = styled.p`
  margin-bottom: 8px;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: #00000073;
`;

const Text = styled.span`
  margin-right: 8px;
`;

const EmptyListWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 64px;
`;

const ListWrapper = styled.div`
  padding: 12px;
`;

const Title = styled.p`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #000;
  margin-bottom: 24px;
`;

export default WebhookList;
