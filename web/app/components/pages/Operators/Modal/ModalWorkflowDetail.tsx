import type React from "react";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Modal from "~/components/atoms/Modal";
import { ModalWorkflowDetailS } from "~/components/pages/Operators/styles";
import { renderPreviewComponent } from "~/components/pages/Templates/TemplatePreview/index";
import type { WorkflowT } from "~/models/templates";

interface Props {
	isModalOpen: boolean;
	onCancel: () => void;
	workflowDetail: WorkflowT | undefined;
	step: number;
}

const ModalWorkflowDetail: React.FC<Props> = ({
	isModalOpen,
	onCancel,
	workflowDetail,
	step,
}) => {
	return (
		<>
			<Modal
				centered
				open={isModalOpen}
				onCancel={onCancel}
				onOk={onCancel}
				title={`Workflow ${jp.modal.detail}`}
				footer={[
					<Button key="ok" type="primary" onClick={onCancel}>
						OK
					</Button>,
				]}
				width={700}
			>
				<ModalWorkflowDetailS>
					<p className="title">{workflowDetail?.name}</p>

					<div className="workflow-list">
						{workflowDetail?.workflowDetails?.map((item, index) => {
							return renderPreviewComponent(item, step === index + 1);
						})}
					</div>
				</ModalWorkflowDetailS>
			</Modal>
		</>
	);
};

export default ModalWorkflowDetail;
