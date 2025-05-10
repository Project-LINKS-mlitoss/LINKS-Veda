import { useFetcher, useSearchParams } from "@remix-run/react";
import type React from "react";
import { useEffect, useState } from "react";
import type { SelectRowIdT } from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Icon from "~/components/atoms/Icon";
import Table from "~/components/atoms/Table";
import WrapViewer from "~/components/molecules/Common/WrapViewer";
import ModalChooseContent from "~/components/pages/Operators/Modal/ModalChooseContent";
import ModalContentDetail from "~/components/pages/Operators/Modal/ModalContentDetail";
import ViewerContainer from "~/components/pages/Operators/ViewerContent/ViewerContainer";
import { InputOperatorS } from "~/components/pages/Operators/styles";
import type { ContentItem } from "~/models/content";
import type { SpatialJoinContentConfigs } from "~/models/operators";
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
	setContentIdLeft: (val: string) => void;
	data?: SpatialJoinContentConfigs | null;
	onClickShrinkOutlined?: () => void;
}

const InputOperator: React.FC<Props> = (props) => {
	// props
	const { setContentIdLeft, data, onClickShrinkOutlined } = props;

	// Remix
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
			setContentIdLeft(selectedContent?.id);
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
