import { Form, useLocation } from "@remix-run/react";
import type React from "react";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Icon from "~/components/atoms/Icon";
import Input from "~/components/atoms/Input";
import Modal from "~/components/atoms/Modal";
import { ModalContent } from "~/components/pages/Operators/styles";
import { ACTION_TYPES_OPERATOR } from "~/models/operators";
import type { PREPROCESSING_TYPE } from "~/models/processingStatus";

interface RenameContentModalProps {
	isModalOpen: boolean;
	contentName: string;
	modelId: string | undefined;
	onContentNameChange: (value: string) => void;
	onCancel: () => void;
	operatorType: PREPROCESSING_TYPE | undefined;
	operatorId: number | undefined;
}

const RenameContentModal: React.FC<RenameContentModalProps> = ({
	isModalOpen,
	contentName,
	modelId,
	onContentNameChange,
	onCancel,
	operatorType,
	operatorId,
}) => {
	const location = useLocation();
	const fullPath = `${location.pathname}${location.search}`;

	return (
		<Modal
			centered
			open={isModalOpen}
			onCancel={onCancel}
			footer={null}
			title={`${jp.common.content}${jp.common.save}`}
		>
			<ModalContent>
				<div className="modal-item">
					<p className="question">コンテンツ名を変更しますか？</p>
				</div>

				<Form method="POST" className="form-edit-name" action={fullPath}>
					<Input
						id="name"
						name="name"
						value={contentName ?? ""}
						prefix={<Icon icon="schema" />}
						onChange={(e) => onContentNameChange(e.target.value)}
					/>

					<Input type="hidden" name="contentId" value={modelId} />
					<Input type="hidden" name="operatorType" value={operatorType} />
					<Input type="hidden" name="operatorId" value={operatorId} />
					<Input
						type="hidden"
						name="actionType"
						value={ACTION_TYPES_OPERATOR.RENAME}
					/>

					<div className="buttons">
						<>
							<Button htmlType="button" type="default" onClick={onCancel}>
								キャンセル
							</Button>
							<Button
								htmlType="submit"
								name="_action"
								key="rename"
								value="rename"
								type="primary"
							>
								保存
							</Button>
						</>
					</div>
				</Form>
			</ModalContent>
		</Modal>
	);
};

export default RenameContentModal;
