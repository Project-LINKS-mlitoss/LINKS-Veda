import { useFetcher, useSearchParams } from "@remix-run/react";
import type React from "react";
import { useEffect, useState } from "react";
import { CONTENT_FIELD_TYPE, type SelectRowIdT } from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Icon from "~/components/atoms/Icon";
import Table from "~/components/atoms/Table";
import WrapViewer from "~/components/molecules/Common/WrapViewer";
import ModalChooseContent from "~/components/pages/Operators/Modal/ModalChooseContent";
import ModalContentDetail from "~/components/pages/Operators/Modal/ModalContentDetail";
import ViewerContainer from "~/components/pages/Operators/ViewerContent/ViewerContainer";
import { InputOperatorS } from "~/components/pages/Operators/styles";
import type { OptionColumnsT } from "~/components/pages/Operators/types";
import type { ContentItem } from "~/models/content";
import type { SpatialAggregationContentConfigs } from "~/models/operators";
import type { ApiResponse } from "~/repositories/utils";
import { routes } from "~/routes/routes";

const columnSelectedFile = [
	{
		title: jp.common.title,
		dataIndex: "title",
		key: "title",
		render: (text: string) => (
			<div className="title-content">
				<Icon icon="schema" size={14} />
				<span>{text}</span>
			</div>
		),
	},
	{
		title: jp.common.updatedAt,
		dataIndex: "updateAt",
		key: "updateAt",
	},
];

interface Props {
	setContentId: (val: string) => void;
	data?: SpatialAggregationContentConfigs | null;
	onClickShrinkOutlined?: () => void;
	setOptionColumnsLeft: (val: OptionColumnsT[] | undefined) => void;
}

const InputOperator: React.FC<Props> = (props) => {
	// props
	const { setContentId, data, onClickShrinkOutlined, setOptionColumnsLeft } =
		props;
	const fetchContentDetail = useFetcher<ApiResponse<ContentItem>>();
	const [searchParams] = useSearchParams();
	const contentInputId = searchParams.get("contentInputId");

	// state
	const [selectedContent, setSelectedContent] = useState<
		ContentItem | undefined
	>();
	const updatedAt = new Date(selectedContent?.updatedAt ?? "");
	const [tempSelectedContent, setTempSelectedContent] = useState<
		ContentItem | undefined
	>();
	const [isModalChooseContentOpen, setIsModalChooseContentOpen] =
		useState(false);
	const [isModalDetailContentOpen, setIsModalDetailContentOpen] =
		useState(false);
	const [selectedRowId, setSelectedRowId] = useState<SelectRowIdT | null>(null);

	// effect
	useEffect(() => {
		if (!selectedContent) {
			setSelectedRowId(null);
		}
	}, [selectedContent]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (data?.leftContentId || contentInputId) {
			fetchContentDetail.load(
				`${routes.content}/${data?.leftContentId || contentInputId}`,
			);
		}
	}, [data]);

	useEffect(() => {
		if (fetchContentDetail?.data?.status) {
			setSelectedContent(fetchContentDetail?.data?.data);
		}
	}, [fetchContentDetail]);

	useEffect(() => {}, []);

	// function
	const handleOpenModalChooseContent = () => {
		setTempSelectedContent(selectedContent);
		setIsModalChooseContentOpen(true);
	};

	const handleOpenModalDetailContent = () => {
		setIsModalDetailContentOpen(true);
	};

	const handleApply = () => {
		setSelectedContent(tempSelectedContent);
		setIsModalDetailContentOpen(false);
		setIsModalChooseContentOpen(false);
	};

	// Handle input,
	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (selectedContent) {
			setContentId(selectedContent?.id);
			setOptionColumnsLeft(
				// No change schema to content because this is data from CMS
				selectedContent?.schema?.fields
					?.filter((field) => field?.type !== CONTENT_FIELD_TYPE.GEO)
					?.map((field) => ({
						label: field?.key,
						value: field?.key,
					})),
			);
		}
	}, [selectedContent]);

	return (
		<WrapViewer
			title={jp.operator.input}
			icon={<Icon icon="file" size={16} />}
			isShowShrinkOutlined
			onClickShrinkOutlined={onClickShrinkOutlined}
		>
			<InputOperatorS>
				<div className="selected-file choose-content-spatial-join">
					<div className="choose-input">
						<span>メイン地図データ:</span>
						<Button
							icon={<Icon icon="table" />}
							onClick={handleOpenModalChooseContent}
						>
							{jp.common.content}
							{jp.common.choose}
						</Button>
					</div>

					<div className="file-selected">
						<Table
							dataSource={
								selectedContent
									? [
											{
												key: selectedContent?.id,
												id: selectedContent?.id,
												title: selectedContent?.name,
												updateAt: `${updatedAt.getUTCFullYear()}-${
													updatedAt.getUTCMonth() + 1
												}-${updatedAt.getUTCDate()} ${updatedAt.getUTCHours()}:${updatedAt.getUTCMinutes()}`,
											},
										]
									: []
							}
							columns={columnSelectedFile}
							pagination={false}
							className="panel-table"
							rowClassName="selected-row"
						/>
					</div>
				</div>

				<div className="viewer">
					{selectedContent && (
						<ViewerContainer
							isPreview={false}
							item={selectedContent}
							hasGeoData={true}
							wrapperClassName="viewer-content"
							gisMapClassName="gis-viewer h-40 b-bottom"
							tableClassName="content-viewer h-60"
							selectedRowId={selectedRowId}
							onSelectRow={setSelectedRowId}
							gisIcon={<Icon icon="strucOrigin" size={16} />}
							contentIcon={<Icon icon="schema" size={16} />}
						/>
					)}
				</div>
			</InputOperatorS>

			<ModalChooseContent
				isOpen={isModalChooseContentOpen}
				onCancel={() => setIsModalChooseContentOpen(false)}
				onOk={handleOpenModalDetailContent}
				tempSelectedContent={tempSelectedContent}
				setTempSelectedContent={setTempSelectedContent}
				selectedContent={tempSelectedContent}
				isOnlyGeojson={true}
			/>

			<ModalContentDetail
				isOpen={isModalDetailContentOpen}
				onCancel={() => setIsModalDetailContentOpen(false)}
				onApply={handleApply}
				selectedContent={tempSelectedContent}
			/>
		</WrapViewer>
	);
};

export default InputOperator;
