import { useFetcher } from "@remix-run/react";
import type React from "react";
import { useEffect, useState } from "react";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Icon from "~/components/atoms/Icon";
import Input from "~/components/atoms/Input";
import Modal from "~/components/atoms/Modal";
import Table from "~/components/atoms/Table";
import type {
	OPERATOR_TYPE,
	TemplatesResponse,
	TemplatesT,
	WorkflowT,
} from "~/models/templates";
import type { ApiResponse } from "~/repositories/utils";
import { routes } from "~/routes/routes";
import { theme } from "~/styles/theme";
import { ModalSelectTemplateS } from "../styles";

interface SelectTemplateModalProps {
	isModalSelectOpen: boolean;
	setIsModalSelectOpen: (val: boolean) => void;
	tempTemplate: TemplatesT | WorkflowT | undefined;
	setTempTemplate: (val: TemplatesT | undefined) => void;
	operatorType: OPERATOR_TYPE | undefined;
	handleAcceptedTemplate: () => void;
}

const ModalSelectTemplate: React.FC<SelectTemplateModalProps> = ({
	isModalSelectOpen,
	setIsModalSelectOpen,
	tempTemplate,
	setTempTemplate,
	operatorType,
	handleAcceptedTemplate,
}: SelectTemplateModalProps) => {
	// Remix
	const fetchTemplates = useFetcher<ApiResponse<TemplatesResponse>>();

	// State
	const [tempKeyword, setTempKeyword] = useState("");
	const [keyword, setKeyword] = useState("");
	const [templates, setTemplates] = useState<TemplatesResponse>();

	// Get templates
	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		fetchTemplates.load(
			`${routes.template}?operatorType=${operatorType}&keyword=${keyword}`,
		);
	}, [tempKeyword, operatorType]);
	useEffect(() => {
		if (fetchTemplates?.data?.status) {
			setTemplates(fetchTemplates?.data?.data);
		}
	}, [fetchTemplates]);

	const handleCancelModalSelectTemplate = () => {
		setTempTemplate(undefined);
		setIsModalSelectOpen(false);
	};

	const columnsChooseTemplate = [
		{
			title: `${jp.common.template}${jp.common.name}`,
			dataIndex: "name",
			key: "name",
		},
	];

	const getRowClassNameChooseTemplate = (record: TemplatesT) =>
		tempTemplate && record.id === tempTemplate.id ? "selected-row" : "";

	const handleRowClickChooseTemplate = (record: TemplatesT) => {
		setTempTemplate(record);
	};

	return (
		<Modal
			centered
			open={isModalSelectOpen}
			onCancel={handleCancelModalSelectTemplate}
			title={`${jp.common.template}${jp.modal.select}`}
			width={640}
			footer={null}
		>
			<ModalSelectTemplateS>
				<div className="filter">
					<Input
						placeholder={jp.common.inputSearchText}
						className="input-search"
						value={tempKeyword}
						onChange={(e) => setTempKeyword(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								setKeyword(tempKeyword);
							}
						}}
					/>

					<button
						type="button"
						className="button-search"
						onClick={() => setKeyword(tempKeyword)}
					>
						<Icon icon="search" color={theme.colors.lightGray} />
					</button>
				</div>

				<Table
					className="table-file"
					bordered
					dataSource={templates?.map((template) => ({
						...template,
						key: template.id,
					}))}
					columns={columnsChooseTemplate}
					rowClassName={getRowClassNameChooseTemplate}
					pagination={false}
					scroll={{ y: 300 }}
					onRow={(record) => ({
						onClick: () => handleRowClickChooseTemplate(record),
					})}
				/>
				<div className="buttons">
					<>
						<Button
							htmlType="button"
							type="default"
							onClick={handleCancelModalSelectTemplate}
						>
							{jp.common.cancel}
						</Button>
						<Button
							htmlType="button"
							type="primary"
							disabled={!tempTemplate}
							onClick={handleAcceptedTemplate}
						>
							{jp.modal.accept}
						</Button>
					</>
				</div>
			</ModalSelectTemplateS>
		</Modal>
	);
};

export default ModalSelectTemplate;
