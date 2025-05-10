import { useFetcher } from "@remix-run/react";
import type React from "react";
import { useEffect, useState } from "react";
import jp from "~/commons/locales/jp";
import Icon from "~/components/atoms/Icon";
import Input from "~/components/atoms/Input";
import Modal from "~/components/atoms/Modal";
import Table from "~/components/atoms/Table";
import { ModalContent } from "~/components/pages/Operators/styles";
import type { TemplatesResponse, TemplatesT } from "~/models/templates";
import type { ApiResponse } from "~/repositories/utils";
import { routes } from "~/routes/routes";
import { theme } from "~/styles/theme";
import { ModalSelectTemplateS } from "../../Templates/styles";
import ModalOverwriteTemplate from "./ModalOverwriteTemplate";

interface Props {
	isModalOpen: boolean;
	templateName: string;
	setNameTemplate: (value: string) => void;
	templateId: number | undefined;
	setTemplateId: (value: number | undefined) => void;
	onCancel: () => void;
	handleSave: () => void;
	isLoadingSave: boolean;
	operatorType: string;
}

const ModalSaveTemplate: React.FC<Props> = ({
	isModalOpen,
	templateName,
	setNameTemplate,
	templateId,
	setTemplateId,
	onCancel,
	handleSave,
	isLoadingSave,
	operatorType,
}) => {
	// Remix
	const fetchTemplateDetail = useFetcher<ApiResponse<TemplatesResponse>>();

	// State
	const [tempKeyword, setTempKeyword] = useState("");
	const [keyword, setKeyword] = useState("");
	const [templates, setTemplates] = useState<TemplatesResponse>();
	const [isOpenModalOverwrite, setIsOpenModalOverwrite] = useState(false);

	// Get templates
	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		fetchTemplateDetail.load(
			`${routes.template}?operatorType=${operatorType}&keyword=${keyword}`,
		);
	}, [tempKeyword, operatorType]);
	useEffect(() => {
		if (fetchTemplateDetail?.data?.status) {
			setTemplates(fetchTemplateDetail?.data?.data);
		}
	}, [fetchTemplateDetail]);

	const columnsChooseTemplate = [
		{
			title: `${jp.common.template}${jp.common.name}`,
			dataIndex: "name",
			key: "name",
		},
	];

	const getRowClassNameChooseTemplate = (record: TemplatesT) =>
		templateId && record.id === templateId ? "selected-row" : "";

	const handleRowClickChooseTemplate = (record: TemplatesT) => {
		setTemplateId(record.id);
		setNameTemplate(record.name);
	};

	// Handle template name change
	const handleTemplateNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setNameTemplate(e.target.value);
	};

	useEffect(() => {
		const matchingTemplate = templates?.find(
			(template) => template.name === templateName,
		);

		if (matchingTemplate) {
			setTemplateId(matchingTemplate.id);
		} else {
			setTemplateId(undefined);
		}
	}, [templateName, templates, setTemplateId]);

	const handleConfirm = () => {
		if (templateId) {
			setIsOpenModalOverwrite(true);
		} else {
			handleSave();
		}
	};

	return (
		<>
			<Modal
				centered
				open={isModalOpen}
				onCancel={onCancel}
				onOk={handleConfirm}
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
					</ModalSelectTemplateS>

					<div className="title">
						{jp.common.template}
						{jp.common.name}
						<span className="required">*</span>
					</div>
					<Input
						value={templateName ?? ""}
						placeholder="テンプレート名"
						onChange={handleTemplateNameChange}
					/>
				</ModalContent>
			</Modal>

			<ModalOverwriteTemplate
				isModalOpen={isOpenModalOverwrite}
				templateName={templateName}
				onCancel={() => setIsOpenModalOverwrite(false)}
				handleSave={() => {
					handleSave();
					setIsOpenModalOverwrite(false);
				}}
				isLoadingSave={isLoadingSave}
			/>
		</>
	);
};

export default ModalSaveTemplate;
