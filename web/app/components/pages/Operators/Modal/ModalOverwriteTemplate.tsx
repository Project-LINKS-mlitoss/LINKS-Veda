import type React from "react";
import jp from "~/commons/locales/jp";
import Icon from "~/components/atoms/Icon";
import Input from "~/components/atoms/Input";
import Modal from "~/components/atoms/Modal";
import { ModalContent } from "~/components/pages/Operators/styles";

interface Props {
	isModalOpen: boolean;
	templateName: string;
	onCancel: () => void;
	handleSave: () => void;
	isLoadingSave: boolean;
}

const ModalOverwriteTemplate: React.FC<Props> = ({
	isModalOpen,
	templateName,
	onCancel,
	handleSave,
	isLoadingSave,
}) => {
	return (
		<Modal
			centered
			open={isModalOpen}
			onCancel={onCancel}
			onOk={handleSave}
			cancelText={jp.common.cancel}
			okText={jp.common.save}
			title={jp.common.saveTemplate}
			okButtonProps={{
				loading: isLoadingSave,
				disabled: !templateName,
			}}
			width={640}
		>
			<ModalContent>
				<div className="modal-item">
					<p className="question">
						この名前のテンプレートはすでに存在しています
					</p>
				</div>
				<Input
					prefix={<Icon icon="templateBox" />}
					value={templateName ?? ""}
					placeholder="テンプレート名"
				/>
				<div className="form-edit-name">
					<p className="notification">上書きしますか？</p>
				</div>
			</ModalContent>
		</Modal>
	);
};

export default ModalOverwriteTemplate;
