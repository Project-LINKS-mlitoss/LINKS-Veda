import { useFetcher } from "@remix-run/react";
import type React from "react";
import { useEffect, useState } from "react";
import { CONTENT_MANAGEMENT_PUBLISH } from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import Icon from "~/components/atoms/Icon";
import Input from "~/components/atoms/Input";
import Modal from "~/components/atoms/Modal";
import Table from "~/components/atoms/Table";
import { DefaultCurrent, DefaultPageSize } from "~/components/molecules/Common";
import { ModalSelectContentS } from "~/components/pages/Dataset/styles";
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

interface ModalSelectContentProps {
	isOpen: boolean;
	onCancel: () => void;
	onOk: () => void;
	selectedContents: (ContentItem | undefined)[];
	tempSelectedContents: (ContentItem | undefined)[];
	setTempSelectedContents: React.Dispatch<
		React.SetStateAction<(ContentItem | undefined)[]>
	>;
	isMultiple: boolean;
}

const ModalSelectContent: React.FC<ModalSelectContentProps> = ({
	isOpen,
	onCancel,
	onOk,
	selectedContents,
	tempSelectedContents,
	setTempSelectedContents,
	isMultiple,
}) => {
	// Get schema
	const fetchContents = useFetcher<ApiResponse<ContentResponse>>();
	const isLoadContents = fetchContents.state === "loading";
	const [contents, setContents] = useState<ContentItem[]>();
	const [keywordContent, setKeywordContent] = useState("");
	const [tempKeywordContent, setTempKeywordContent] = useState("");

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		fetchContents.load(
			`${routes.contentVisualize}?keyword=${keywordContent}&statusVisualize=${CONTENT_MANAGEMENT_PUBLISH.PUBLISH}&page=${DefaultCurrent}&perPage=100`,
		);
	}, [keywordContent]);

	useEffect(() => {
		if (fetchContents?.data?.status) {
			setContents(fetchContents?.data?.data?.models);
		}
	}, [fetchContents]);

	const dataSourceChooseContent = contents?.map((item) => {
		const updatedAt = new Date(item?.updatedAt);
		return {
			key: item?.id,
			content: item?.name,
			updateTime: `${updatedAt.getUTCFullYear()}-${
				updatedAt.getUTCMonth() + 1
			}-${updatedAt.getUTCDate()} ${updatedAt.getUTCHours()}:${updatedAt.getUTCMinutes()}`,
			updateBy: item?.createdBy ?? "N/A",
		};
	});

	return (
		<Modal
			centered
			open={isOpen}
			onCancel={onCancel}
			title={"コンテンツ選択"}
			onOk={onOk}
			okButtonProps={{
				disabled: !tempSelectedContents,
			}}
			cancelText={jp.common.cancel}
			okText={jp.common.load}
			width={640}
		>
			<ModalSelectContentS>
				<div className="filter">
					<Input
						placeholder={jp.common.inputSearchText}
						className="input-search"
						value={tempKeywordContent}
						onChange={(e) => setTempKeywordContent(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								setKeywordContent(tempKeywordContent);
							}
						}}
					/>
					<button
						type="button"
						className="button-search"
						onClick={() => setKeywordContent(tempKeywordContent)}
					>
						<Icon icon="search" color={theme.colors.lightGray} />
					</button>
				</div>

				<Table
					className="table-file"
					bordered
					loading={isLoadContents}
					dataSource={dataSourceChooseContent}
					columns={columnsChooseContent}
					rowClassName={(record) => {
						const isDisabled = selectedContents.some(
							(item) => item?.id === record.key,
						);
						const isSelected = tempSelectedContents.some(
							(item) => item?.id === record.key,
						);

						return `${isDisabled ? "disabled-row" : ""} ${isSelected ? "selected-row" : ""}`.trim();
					}}
					pagination={false}
					scroll={{ y: 300 }}
					onRow={(record) => {
						const isDisabled = selectedContents.some(
							(item) => item?.id === record.key,
						);
						if (isDisabled) return {};

						return {
							onClick: () => {
								const selected = contents?.find(
									(item) => item.id === record.key,
								);
								if (!selected) return;

								setTempSelectedContents((prev: (ContentItem | undefined)[]) => {
									if (isMultiple) {
										const updatedSelection: (ContentItem | undefined)[] =
											prev.some((item) => item?.id === selected.id)
												? prev.filter((item) => item?.id !== selected.id)
												: [...prev, selected];

										return updatedSelection;
									}
									return [selected];
								});
							},
						};
					}}
				/>
			</ModalSelectContentS>
		</Modal>
	);
};

export default ModalSelectContent;
