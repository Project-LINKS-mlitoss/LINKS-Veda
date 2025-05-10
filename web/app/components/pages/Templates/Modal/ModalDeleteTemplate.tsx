import { Form, useLocation } from "@remix-run/react";
import type React from "react";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Icon from "~/components/atoms/Icon";
import Input from "~/components/atoms/Input";
import Modal from "~/components/atoms/Modal";
import { ModalContent } from "~/components/pages/Content/styles";
import {
	OPERATOR_TYPE,
	type TemplatesT,
	type WorkflowT,
} from "~/models/templates";

interface Props {
	isModalDeleteOpen: boolean;
	setIsModalDeleteOpen: (val: boolean) => void;
	tempChoose: TemplatesT | WorkflowT | undefined;
	isDeleting: boolean;
	setIsDeleting: (val: boolean) => void;
}

const ModalDeleteTemplate: React.FC<Props> = ({
	isModalDeleteOpen,
	setIsModalDeleteOpen,
	tempChoose,
	isDeleting,
	setIsDeleting,
}) => {
	const location = useLocation();
	const fullPath = `${location.pathname}${location.search}`;

	return (
		<Modal
			centered
			open={isModalDeleteOpen}
			onCancel={() => setIsModalDeleteOpen(false)}
			title={`${jp.common.template}${jp.common.delete}`}
			footer={null}
		>
			<ModalContent>
				<div className="modal-item">
					<p className="question">テンプレートを削除しますか?</p>
					<div className="name">
						<Icon icon="templateBox" size={16} />
						<span>{tempChoose?.name}</span>
					</div>
				</div>

				<Form method="DELETE" className="form" action={fullPath}>
					<Input
						type="hidden"
						name="templateId"
						value={
							tempChoose && "workflowDetails" in tempChoose
								? String((tempChoose as WorkflowT).id).replace(
										OPERATOR_TYPE.WORK_FLOW,
										"",
									)
								: tempChoose?.id
						}
					/>
					<Input
						type="hidden"
						name="isWorkflow"
						value={JSON.stringify(
							tempChoose && "workflowDetails" in tempChoose,
						)}
					/>
					<Button
						htmlType="submit"
						type="default"
						name="_action"
						value="delete"
						key="delete"
						loading={isDeleting}
						onClick={() => setIsDeleting(true)}
					>
						{jp.common.delete}
					</Button>
					<Button
						htmlType="button"
						type="primary"
						onClick={() => setIsModalDeleteOpen(false)}
						key="cancel"
					>
						{jp.common.cancel}
					</Button>
				</Form>
			</ModalContent>
		</Modal>
	);
};

export default ModalDeleteTemplate;
