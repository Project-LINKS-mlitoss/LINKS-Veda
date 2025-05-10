import { useFetcher } from "@remix-run/react";
import type React from "react";
import { useEffect, useState } from "react";
import { CONTENT_FIELD_TYPE } from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import Icon from "~/components/atoms/Icon";
import Input from "~/components/atoms/Input";
import Modal from "~/components/atoms/Modal";
import Table from "~/components/atoms/Table";
import { formatDateToUTC } from "~/components/molecules/Common/utils";
import { ModalChooseFile } from "~/components/pages/Operators/styles";
import type { ContentTableRecord } from "~/components/pages/Operators/types";
import type { ContentItem, ContentResponse } from "~/models/content";
import type { ApiResponse } from "~/repositories/utils";
import { routes } from "~/routes/routes";
import { theme } from "~/styles/theme";

const columnsChooseContent = [
	{
		title: (
			<div className="col-name">
				<Icon icon="schema" /> {jp.common.content}
			</div>
		),
		dataIndex: "content",
		key: "content",
	},
	{
		title: (
			<div className="col-name">
				<Icon icon="clock" /> {jp.common.updatedTime}
			</div>
		),
		dataIndex: "updateTime",
		key: "updateTime",
	},
	{
		title: (
			<div className="col-name">
				<Icon icon="user" /> {jp.common.updatedBy}
			</div>
		),
		dataIndex: "updateBy",
		key: "updateBy",
	},
];

interface ModalChooseContentProps {
	isOpen: boolean;
	onCancel: () => void;
	onOk: () => void;
	tempSelectedContent: ContentItem | undefined;
	setTempSelectedContent: (value: ContentItem | undefined) => void;
	selectedContent?: ContentItem;
	isOnlyGeojson?: boolean;
	isOnlyJson?: boolean;
}

const ModalChooseContent: React.FC<ModalChooseContentProps> = ({
	isOpen,
	onCancel,
	onOk,
	tempSelectedContent,
	setTempSelectedContent,
	selectedContent,
	isOnlyGeojson = false,
	isOnlyJson = false,
}) => {
	// Remix
	const fetchContents = useFetcher<ApiResponse<ContentResponse>>();
	const isLoadContent = fetchContents.state === "loading";

	// State
	const [contents, setContents] = useState<ContentItem[]>();
	const [isFirstFetch, setIsFirstFetch] = useState(true);
	const [tempKeywordContent, setTempKeywordContent] = useState("");

	// Function
	const handleFetchContents = (keywordContent?: string) => {
		fetchContents.load(
			`${routes.content}?perPage=20&keyword=${keywordContent ?? ""}`,
		);
	};

	// Effect
	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (isOpen && isFirstFetch) {
			handleFetchContents();
			setIsFirstFetch(false);
		}
	}, [isOpen]);

	useEffect(() => {
		if (!fetchContents?.data?.status) return;

		let contentsFilter: ContentItem[];
		if (isOnlyGeojson) {
			contentsFilter = fetchContents.data.data.models.filter((content) =>
				content?.schema?.fields?.some(
					(field) => field?.type === CONTENT_FIELD_TYPE.GEO,
				),
			);
		} else if (isOnlyJson) {
			contentsFilter = fetchContents.data.data.models.filter((content) =>
				content?.schema?.fields?.every(
					(field) => field?.type !== CONTENT_FIELD_TYPE.GEO,
				),
			);
		} else {
			contentsFilter = fetchContents.data.data.models;
		}
		setContents(contentsFilter);
	}, [fetchContents, isOnlyGeojson, isOnlyJson]);

	const dataSourceChooseContent = contents?.map((item) => {
		return {
			key: item?.id,
			content: item?.name,
			updateTime: formatDateToUTC(item?.updatedAt),
			updateBy: item?.createdBy ?? "N/A",
		};
	});

	const getRowClassNameChooseContent = (record: ContentTableRecord) => {
		return selectedContent?.id === record.key ? "selected-row" : "";
	};

	return (
		<Modal
			centered
			open={isOpen}
			onCancel={onCancel}
			title={`${jp.common.content}${jp.modal.selectInsertContent}`}
			onOk={onOk}
			okButtonProps={{
				disabled: !tempSelectedContent,
			}}
			cancelText={jp.common.cancel}
			okText={jp.common.showResult}
			width={640}
		>
			<ModalChooseFile>
				<div className="filter">
					<Input
						placeholder={jp.common.inputSearchText}
						className="input-search"
						value={tempKeywordContent}
						onChange={(e) => setTempKeywordContent(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								handleFetchContents(tempKeywordContent);
							}
						}}
					/>
					<button
						type="button"
						className="button-search"
						onClick={() => handleFetchContents(tempKeywordContent)}
					>
						<Icon icon="search" color={theme.colors.lightGray} />
					</button>
				</div>

				<Table
					className="table-file"
					bordered
					loading={isLoadContent}
					dataSource={dataSourceChooseContent}
					columns={columnsChooseContent}
					rowClassName={getRowClassNameChooseContent}
					pagination={false}
					scroll={{ y: 300 }}
					onRow={(record) => ({
						onClick: () => {
							const selected = contents?.find((item) => item.id === record.key);
							setTempSelectedContent(selected);
						},
					})}
				/>
			</ModalChooseFile>
		</Modal>
	);
};

export default ModalChooseContent;
