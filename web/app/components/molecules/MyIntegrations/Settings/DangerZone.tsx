import styled from "@emotion/styled";
import { useCallback } from "react";

import Button from "app/components/atoms/Button";
import Icon from "app/components/atoms/Icon";
import ContentSection from "app/components/atoms/InnerContents/ContentSection";
import Modal from "app/components/atoms/Modal";

export interface Props {
	onIntegrationDelete: () => Promise<void>;
}

const DangerZone: React.FC<Props> = ({ onIntegrationDelete }) => {
	const { confirm } = Modal;

	const handleWorkspaceDeleteConfirmation = useCallback(() => {
		confirm({
			title: "本当にこのインテグレーションを削除してよろしいですか？",
			icon: <Icon icon="exclamationCircle" />,
			content: (
				<>
					インテグレーションを削除します。この操作は取り消すことができません。
					<br />
					インテグレーション削除すると、このインテグレーションを利用しているすべてのワークスペースから取り除かれます。
				</>
			),
			onOk() {
				onIntegrationDelete();
			},
		});
	}, [confirm, onIntegrationDelete]);

	return (
		<ContentSection title="重要操作" danger>
			<Title>インテグレーションの削除</Title>
			<Text>
				インテグレーションを削除します。この操作は取り消すことができません。
			</Text>

			<Button onClick={handleWorkspaceDeleteConfirmation} type="primary" danger>
				インテグレーションを削除
			</Button>
		</ContentSection>
	);
};

export default DangerZone;

const Title = styled.h1`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #000000d9;
`;

const Text = styled.p`
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: #000000d9;
  margin: 24px 0;
`;
