import styled from "@emotion/styled";
import { useCallback } from "react";

import Button from "app/components/atoms/Button";
import Icon from "app/components/atoms/Icon";
import ContentSection from "app/components/atoms/InnerContents/ContentSection";
import Modal from "app/components/atoms/Modal";

interface Props {
	onWorkspaceDelete: () => Promise<void>;
}

const DangerZone: React.FC<Props> = ({ onWorkspaceDelete }) => {
	const { confirm } = Modal;

	const handleWorkspaceDeleteConfirmation = useCallback(() => {
		confirm({
			title: "このワークスペースを削除します。よろしいですか？",
			icon: <Icon icon="exclamationCircle" />,
			onOk() {
				onWorkspaceDelete();
			},
		});
	}, [confirm, onWorkspaceDelete]);

	return (
		<ContentSection title="重要操作" danger>
			<Title>ワークスペースを削除</Title>
			<Text>
				現在のワークスペースを削除します。ワークスペースに関連するすべてのデータが削除されます。この操作を取り消すことはできません。
			</Text>

			<Button onClick={handleWorkspaceDeleteConfirmation} type="primary" danger>
				ワークスペースを削除
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
