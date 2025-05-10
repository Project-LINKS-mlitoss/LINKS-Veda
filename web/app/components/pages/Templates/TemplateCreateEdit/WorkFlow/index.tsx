import type { JsonValue } from "@prisma/client/runtime/library";
import { useActionData, useLocation, useSubmit } from "@remix-run/react";
import type React from "react";
import { useEffect, useState } from "react";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Icon from "~/components/atoms/Icon";
import Input from "~/components/atoms/Input";
import { showNotification } from "~/components/molecules/Common/utils";
import { WorkFlowS } from "~/components/pages/Templates/styles";
import {
	ACTION_TYPES_TEMPLATE,
	OPERATOR_TYPE,
	type TemplatesT,
	type WorkflowListT,
	type WorkflowT,
} from "~/models/templates";
import type { ApiResponse } from "~/repositories/utils";
import ModalAddOperator from "../../Modal/ModalAddOperator";
import ModalSelectTemplate from "../../Modal/ModalSelectTemplate";
import { MODE_TEMPLATE } from "../../types";
import CrossTabAddCol from "../CrossTab/CrossTabAddCol";
import DataStructureAddCol from "../DataStructure/DataStructureAddCol";
import PreProcessingAddOption from "../PreProcessing/PreProcessingAddOption";
import SpatialAggregationAdding from "../SpatialAggregation/SpatialAggregationAdding";
import SpatialJoinAddContent from "../SpatialJoin/SpatialJoinAddContent";
import TextMatchingAddContent from "../TextMatching/TextMatchingAddContent";

interface Props {
	data?: WorkflowT | null;
	modeTemplate: MODE_TEMPLATE;
}

const WorkFlow: React.FC<Props> = ({ data, modeTemplate }) => {
	// Remix
	const submit = useSubmit();
	const actionData = useActionData<ApiResponse<WorkflowT>>();
	const location = useLocation();
	const fullPath = `${location.pathname}${location.search}`;

	// State
	const [isModalSelectOpen, setIsModalSelectOpen] = useState(false);
	const [isModalAddOperator, setIsModalAddOperator] = useState(false);
	const [workflowName, setWorkflowName] = useState("");
	const [templateDataStructure, setTemplateDataStructure] = useState<
		JsonValue | undefined
	>();
	const [tempTemplate, setTempTemplate] = useState<TemplatesT>();
	const [templates, setTemplates] = useState<WorkflowListT[]>([]);
	const [isLoadingSave, setIsLoadingSave] = useState(false);

	// Handle detail, edit
	useEffect(() => {
		if (data) {
			setWorkflowName(data?.name);

			const step1Data = data.workflowDetails?.find(
				(detail: WorkflowListT) => detail.step === 1,
			);

			if (
				step1Data &&
				step1Data.operatorType === OPERATOR_TYPE.DATA_STRUCTURE
			) {
				setTemplateDataStructure(step1Data.configJson);
				setTemplates(data.workflowDetails ? data.workflowDetails.slice(1) : []);
			} else {
				setTemplates(data.workflowDetails ?? []);
			}
		}
	}, [data]);

	// Function
	const handleAcceptedTemplate = () => {
		if (tempTemplate) {
			setTemplateDataStructure(tempTemplate?.configJson);
		}
		setIsModalSelectOpen(false);
	};

	const handleRemoveTemplateByIndex = (index: number) => {
		setTemplates((prevTemplates) => {
			const updatedTemplates = prevTemplates.filter((_, i) => i !== index);
			return updatedTemplates.map((template, i) => ({
				...template,
				step: i + 1,
			}));
		});
	};

	// Handle render template
	function renderTemplate(template: WorkflowListT, index: number) {
		switch (template?.operatorType) {
			case OPERATOR_TYPE.PRE_PROCESSING:
				return (
					<PreProcessingAddOption
						data={template?.configJson}
						mode={MODE_TEMPLATE.USE}
						handleRemoveTemplateByIndex={() =>
							handleRemoveTemplateByIndex(index)
						}
					/>
				);
			case OPERATOR_TYPE.TEXT_MATCHING:
				return (
					<TextMatchingAddContent
						data={template?.configJson}
						mode={MODE_TEMPLATE.USE}
						handleRemoveTemplateByIndex={() =>
							handleRemoveTemplateByIndex(index)
						}
					/>
				);
			case OPERATOR_TYPE.CROSS_TAB:
				return (
					<CrossTabAddCol
						data={template?.configJson}
						mode={MODE_TEMPLATE.USE}
						handleRemoveTemplateByIndex={() =>
							handleRemoveTemplateByIndex(index)
						}
					/>
				);
			case OPERATOR_TYPE.SPATIAL_JOIN:
				return (
					<SpatialJoinAddContent
						contentIdLeft=""
						data={template?.configJson}
						mode={MODE_TEMPLATE.USE}
						handleRemoveTemplateByIndex={() =>
							handleRemoveTemplateByIndex(index)
						}
					/>
				);
			case OPERATOR_TYPE.SPATIAL_AGGREGATE:
				return (
					<SpatialAggregationAdding
						data={template?.configJson}
						mode={MODE_TEMPLATE.USE}
						handleRemoveTemplateByIndex={() =>
							handleRemoveTemplateByIndex(index)
						}
					/>
				);
			default:
				return null;
		}
	}

	// Handle Save
	const handleSave = () => {
		setIsLoadingSave(true);

		const formData = new FormData();
		formData.set("workflowName", workflowName);

		const stepWorkflow: WorkflowListT[] = [];
		let currentStep = 1;
		if (templateDataStructure) {
			stepWorkflow.push({
				step: currentStep,
				operatorType: OPERATOR_TYPE.DATA_STRUCTURE,
				configJson: templateDataStructure,
			});
			currentStep++;
		}
		for (const template of templates) {
			stepWorkflow.push({
				...template,
				step: currentStep,
			});
			currentStep++;
		}
		formData.set("stepWorkflow", JSON.stringify(stepWorkflow));

		submit(formData, { method: "post", action: fullPath });
	};

	// Handle Response data
	useEffect(() => {
		if (actionData && actionData?.actionType === ACTION_TYPES_TEMPLATE.SAVE) {
			if (actionData.status === false) {
				showNotification(false, jp.message.common.saveFailed, actionData.error);
			} else {
				showNotification(true, jp.message.common.saveSuccessful);
			}
			setIsLoadingSave(false);
		}
	}, [actionData]);

	return (
		<>
			<WorkFlowS>
				<div className="setting">
					<div className="title-work-flow">
						<p>
							テンプレート名 <span>*</span>
						</p>
						<Input
							placeholder="テンプレートの名前"
							className="input"
							value={workflowName}
							onChange={(e) => setWorkflowName(e.target.value)}
						/>
					</div>

					<div className="template-data-structure">
						{templateDataStructure ? (
							<DataStructureAddCol
								data={templateDataStructure}
								mode={MODE_TEMPLATE.USE}
								setTemplateDataStructure={setTemplateDataStructure}
							/>
						) : (
							<Button
								className="button-add-template"
								icon={<Icon icon="plus" />}
								onClick={() => setIsModalSelectOpen(true)}
								ghost
							>
								構造化テンプレートを追加
							</Button>
						)}
					</div>

					<div className="add-templates">
						<div className="template">
							{templates.map((template, index) => {
								return (
									<div className="template-item" key={template?.step}>
										{renderTemplate(template, index)}
									</div>
								);
							})}
						</div>

						<div className="wrap-button-add-template">
							<Button
								className="button-add-template"
								icon={<Icon icon="plus" />}
								onClick={() => setIsModalAddOperator(true)}
								ghost
							>
								テンプレートを追加
							</Button>
						</div>
					</div>
				</div>

				<div className="button-bottom">
					<Button
						type="primary"
						disabled={
							(!templates.length && !templateDataStructure) || !workflowName
						}
						loading={isLoadingSave}
						icon={<Icon icon="save" size={16} />}
						onClick={handleSave}
					>
						{jp.common.saveTemplate}
					</Button>
				</div>
			</WorkFlowS>

			<ModalSelectTemplate
				isModalSelectOpen={isModalSelectOpen}
				setIsModalSelectOpen={setIsModalSelectOpen}
				setTempTemplate={setTempTemplate}
				operatorType={OPERATOR_TYPE.DATA_STRUCTURE}
				handleAcceptedTemplate={handleAcceptedTemplate}
				tempTemplate={tempTemplate}
			/>

			<ModalAddOperator
				isModalAddOperator={isModalAddOperator}
				setIsModalAddOperator={setIsModalAddOperator}
				templates={templates}
				setTemplates={setTemplates}
			/>
		</>
	);
};

export default WorkFlow;
