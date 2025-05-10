import { useFetcher, useSearchParams } from "@remix-run/react";
import type React from "react";
import { useEffect, useState } from "react";
import { CONTENT_FIELD_TYPE, type SelectRowIdT } from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Icon from "~/components/atoms/Icon";
import Table from "~/components/atoms/Table";
import WrapViewer from "~/components/molecules/Common/WrapViewer";
import { formatFileSize } from "~/components/molecules/Common/utils";
import ModalChooseContent from "~/components/pages/Operators/Modal/ModalChooseContent";
import ModalContentDetail from "~/components/pages/Operators/Modal/ModalContentDetail";
import ViewerContainer from "~/components/pages/Operators/ViewerContent/ViewerContainer";
import { InputOperatorS } from "~/components/pages/Operators/styles";
import {
	type OptionColumnsT,
	columnSelectedInput,
} from "~/components/pages/Operators/types";
import type { ContentItem } from "~/models/content";
import type { TextMatchingContentConfigs } from "~/models/operators";
import type { ApiResponse } from "~/repositories/utils";
import { routes } from "~/routes/routes";

interface Props {
	setContentIdLeft: (val: string) => void;
	data?: TextMatchingContentConfigs | null;
	onClickShrinkOutlined?: () => void;
	setOptionColumnsLeft: (val: OptionColumnsT[] | undefined) => void;
}

const InputOperator: React.FC<Props> = (props) => {
	// props
	const {
		setContentIdLeft,
		data,
		onClickShrinkOutlined,
		setOptionColumnsLeft,
	} = props;

	// Remix
	const fetchContentDetail = useFetcher<ApiResponse<ContentItem>>();
	const [searchParams] = useSearchParams();
	const contentInputId = searchParams.get("contentInputId");

	// state
	const [selectedContent, setSelectedContent] = useState<
		ContentItem | undefined
	>();
	const isGeoJson = selectedContent
		? selectedContent?.schema?.fields?.some(
				// No change schema to content because this is data from CMS
				(field) => field?.type === CONTENT_FIELD_TYPE.GEO,
			)
		: false;
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
				<div className="selected-file">
					<div className="choose-input">
						<Button icon={<Icon icon="file" />} onClick={() => {}} disabled>
							{jp.common.asset}
							{jp.common.choose}
						</Button>
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
												fileName: selectedContent?.name,
												size: formatFileSize(0),
											},
										]
									: []
							}
							columns={columnSelectedInput}
							pagination={false}
							rowClassName="selected-row"
							scroll={{ x: "max-content" }}
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
							tableClassName={`content-viewer ${isGeoJson ? "h-60" : "h-100"}`}
							selectedRowId={selectedRowId}
							onSelectRow={isGeoJson ? setSelectedRowId : undefined}
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
