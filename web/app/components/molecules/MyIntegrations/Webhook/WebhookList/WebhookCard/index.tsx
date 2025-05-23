import styled from "@emotion/styled";
import { Switch } from "antd";
import { useCallback } from "react";

import Card from "app/components/atoms/Card";
import Icon from "app/components/atoms/Icon";
import type {
	Webhook,
	WebhookTrigger,
} from "app/components/molecules/MyIntegrations/types";

interface Props {
	webhook: Webhook;
	onWebhookDelete: (webhookId: string) => Promise<void>;
	onWebhookUpdate: (data: {
		webhookId: string;
		name: string;
		url: string;
		active: boolean;
		trigger: WebhookTrigger;
	}) => Promise<void>;
	onWebhookSettings: (webhookId: string) => void;
}

const WebhookCard: React.FC<Props> = ({
	webhook,
	onWebhookDelete,
	onWebhookUpdate,
	onWebhookSettings,
}) => {
	const handleWebhookDelete = useCallback(() => {
		onWebhookDelete(webhook.id);
	}, [onWebhookDelete, webhook.id]);

	const handleWebhookUpdate = useCallback(
		(active: boolean) => {
			onWebhookUpdate({ ...webhook, active, webhookId: webhook.id });
		},
		[onWebhookUpdate, webhook],
	);

	return (
		<StyledCard
			title={
				<>
					<WebhookTitle>{webhook.name}</WebhookTitle>
					<Switch
						checkedChildren="ON"
						unCheckedChildren="OFF"
						checked={webhook.active}
						onChange={handleWebhookUpdate}
					/>
				</>
			}
			extra={
				<>
					<Icon
						icon="settings"
						size={16}
						onClick={() => onWebhookSettings(webhook.id)}
					/>
					<StyledIcon icon="delete" size={16} onClick={handleWebhookDelete} />
				</>
			}
		>
			{webhook.url}
		</StyledCard>
	);
};

const WebhookTitle = styled.span`
  display: inline-block;
  margin-right: 8px;
`;

const StyledCard = styled(Card)`
  margin-top: 16px;
`;

const StyledIcon = styled(Icon)`
  margin-left: 12px;
`;

export default WebhookCard;
