import type React from "react";
import { useState } from "react";
import Button from "~/components/atoms/Button";
import {
	OPERATOR_TYPE,
	type TemplatesT,
	type WorkflowListT,
} from "~/models/templates";
import { ModalContent, ModalS } from "../styles";
import ModalSelectTemplate from "./ModalSelectTemplate";

interface ModalAddOperatorProps {
	isModalAddOperator: boolean;
	setIsModalAddOperator: (val: boolean) => void;
	templates: WorkflowListT[];
	setTemplates: (val: WorkflowListT[]) => void;
}

const ModalAddOperator: React.FC<ModalAddOperatorProps> = ({
	isModalAddOperator,
	setIsModalAddOperator,
	templates,
	setTemplates,
}: ModalAddOperatorProps) => {
	const [operatorType, setOperatorType] = useState<OPERATOR_TYPE>();
	const [isModalSelectOpen, setIsModalSelectOpen] = useState(false);
	const [tempTemplate, setTempTemplate] = useState<TemplatesT>();

	const handleAcceptedTemplate = () => {
		if (tempTemplate) {
			const updatedTemplates = templates
				? [
						...templates,
						{
							step: templates.length + 1,
							operatorType: tempTemplate.operatorType,
							configJson: tempTemplate.configJson,
						},
					]
				: [
						{
							step: 1,
							operatorType: tempTemplate.operatorType,
							configJson: tempTemplate.configJson,
						},
					];
			setTemplates(updatedTemplates);
		}

		setIsModalSelectOpen(false);
		setOperatorType(undefined);
		setTempTemplate(undefined);
		setIsModalAddOperator(false);
	};

	const buttons = [
		{
			label: "結合前処理",
			active: operatorType === OPERATOR_TYPE.PRE_PROCESSING,
			function: () => {
				setOperatorType(OPERATOR_TYPE.PRE_PROCESSING);
			},
		},
		{
			label: "テキストマッチング",
			active: operatorType === OPERATOR_TYPE.TEXT_MATCHING,
			function: () => {
				setOperatorType(OPERATOR_TYPE.TEXT_MATCHING);
			},
		},
		{
			label: "クロス集計",
			active: operatorType === OPERATOR_TYPE.CROSS_TAB,
			function: () => {
				setOperatorType(OPERATOR_TYPE.CROSS_TAB);
			},
		},
		{
			label: "空間結合",
			active: operatorType === OPERATOR_TYPE.SPATIAL_JOIN,
			function: () => {
				setOperatorType(OPERATOR_TYPE.SPATIAL_JOIN);
			},
		},
		{
			label: "空間集計",
			active: operatorType === OPERATOR_TYPE.SPATIAL_AGGREGATE,
			function: () => {
				setOperatorType(OPERATOR_TYPE.SPATIAL_AGGREGATE);
			},
		},
	];

	return (
		<>
			<ModalS
				centered
				open={isModalAddOperator}
				onCancel={() => setIsModalAddOperator(false)}
				title="オペレーターを追加"
				footer={false}
			>
				<ModalContent>
					<div className="buttons">
						<div className="option">
							{buttons.map((button) => (
								<Button
									key={button.label}
									htmlType="button"
									type="default"
									className={button.active ? "active-button" : ""}
									onClick={button.function}
								>
									{button.label}
								</Button>
							))}
						</div>
					</div>
					<div className="back">
						<Button
							htmlType="button"
							type="default"
							onClick={() => {
								if (operatorType) {
									setIsModalSelectOpen(true);
								}
							}}
						>
							テンプレートをインポート
						</Button>
					</div>
				</ModalContent>
			</ModalS>

			{operatorType ? (
				<ModalSelectTemplate
					isModalSelectOpen={isModalSelectOpen}
					setIsModalSelectOpen={setIsModalSelectOpen}
					setTempTemplate={setTempTemplate}
					operatorType={operatorType}
					handleAcceptedTemplate={handleAcceptedTemplate}
					tempTemplate={tempTemplate}
				/>
			) : null}
		</>
	);
};

export default ModalAddOperator;
