import styled from "@emotion/styled";

import Dropdown from "app/components/atoms/Dropdown";
import Icon from "app/components/atoms/Icon";
import Modal from "app/components/atoms/Modal";
import type { View } from "app/components/molecules/View/types";

interface Props {
	view: View;
	onViewRenameModalOpen: (view: View) => void;
	onUpdate: (viewId: string, name: string) => Promise<void>;
	onDelete: (viewId: string) => void;
}

const ViewsMenuItem: React.FC<Props> = ({
	view,
	onViewRenameModalOpen,
	onUpdate,
	onDelete,
}) => {
	const children = [
		{
			label: "ビューを更新します",
			key: "update",
			icon: <Icon icon="reload" />,
			onClick: () => onUpdate(view.id, view.name),
		},
		{
			label: "名前の変更",
			key: "rename",
			icon: <Icon icon="edit" />,
			onClick: () => onViewRenameModalOpen(view),
		},
		{
			label: "ビューを削除します",
			key: "remove",
			icon: <Icon icon="delete" />,
			danger: true,
			onClick: () => {
				Modal.confirm({
					title: "本当にこのビューを削除しますか？",
					content: (
						<div>
							<StyledCautionText>
								ビューの削除は元に戻せませんが、コンテンツは影響を受けません。
							</StyledCautionText>
							<StyledCautionText>
								この操作は元に戻せませんので、注意して行ってください。
							</StyledCautionText>
						</div>
					),
					icon: <Icon icon="exclamationCircle" />,
					okText: "削除",
					okButtonProps: { danger: true },
					onOk() {
						onDelete(view.id);
					},
				});
			},
		},
	];

	return (
		<Wrapper>
			{view.name}
			<StyledDropdown trigger={["click"]} menu={{ items: children }}>
				<Icon icon="more" size={16} />
			</StyledDropdown>
		</Wrapper>
	);
};

export default ViewsMenuItem;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
`;

const StyledDropdown = styled(Dropdown)`
  margin-right: 0 !important;
`;

const StyledCautionText = styled.p`
  margin-bottom: 0;
`;
