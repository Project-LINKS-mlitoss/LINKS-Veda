import {
	useActionData,
	useFetcher,
	useLocation,
	useNavigate,
} from "@remix-run/react";
import type * as React from "react";
import { useEffect, useState } from "react";
import { CONTENT_FIELD_TYPE } from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Icon from "~/components/atoms/Icon";
import notification from "~/components/atoms/Notification";
import RenameContentModal from "~/components/pages/Operators/Modal/ModalRenameContent";
import ViewerContainer from "~/components/pages/Operators/ViewerContent/ViewerContainer";
import type { ColumnConfident } from "~/components/pages/Operators/types";
import type { ContentItem, ContentResponse } from "~/models/content";
import { ACTION_TYPES_OPERATOR } from "~/models/operators";
import {
	type DataTableProcessingStatusType,
	PREPROCESSING_TYPE,
} from "~/models/processingStatus";
import type { ApiResponse } from "~/repositories/utils";
import { routes } from "~/routes/routes";

interface Props {
	item?: DataTableProcessingStatusType | null;
	setColumnConfident?: (val: ColumnConfident) => void;
}

const OutputData: React.FC<Props> = (props) => {
	const { item, setColumnConfident } = props;
	const navigate = useNavigate();
	const actionData = useActionData<ApiResponse<ContentResponse>>();
	const fetchContentsDetail = useFetcher<ApiResponse<ContentItem>>();
	const location = useLocation();
	const fullPath = `${location.pathname}${location.search}`;

	const [contentDetail, setContentDetail] = useState<ContentItem>();
	const [contentName, setContentName] = useState<string>();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const isGeoJson = contentDetail
		? contentDetail?.schema?.fields?.some(
				(field) => field?.type === CONTENT_FIELD_TYPE.GEO,
			)
		: false;
	const contentId = item
		? "modelId" in item
			? item?.modelId
			: item.contentId
		: undefined;

	// Handle function
	const handleCancelEditName = () => {
		setIsModalOpen(false);
	};

	const handleOpenModalEditName = () => {
		if (contentDetail) {
			setContentName(contentDetail?.name ?? "");
			setIsModalOpen(true);
		}
	};

	// Effect
	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (item) {
			const contentId = "modelId" in item ? item?.modelId : item?.contentId;
			fetchContentsDetail.load(`${routes.content}/${contentId}`);
		}
	}, [item]);

	useEffect(() => {
		if (fetchContentsDetail?.data?.status) {
			setContentDetail(fetchContentsDetail?.data?.data);
		}
	}, [fetchContentsDetail]);

	useEffect(() => {
		if (contentDetail) {
			setContentName(contentDetail?.name ?? "");
		}
	}, [contentDetail]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (actionData && actionData?.actionType === ACTION_TYPES_OPERATOR.RENAME) {
			if (actionData.status === false) {
				notification.error({
					message: jp.message.common.failed,
					description: actionData.error,
					placement: "topRight",
				});
			} else {
				notification.success({
					message: jp.message.common.successful,
					placement: "topRight",
				});
			}
			setIsModalOpen(false);
			navigate(fullPath, { replace: true });
		}
	}, [actionData]);

	return (
		<>
			<ViewerContainer
				isPreview={false}
				item={contentDetail}
				hasGeoData={isGeoJson}
				wrapperClassName="viewer"
				gisMapClassName="gis-viewer h-40 b-bottom"
				tableClassName={`content-viewer ${isGeoJson ? "h-60" : "h-100"}`}
				setColumnConfident={
					item?.operatorType === PREPROCESSING_TYPE.CONTENT_CONFIGS
						? setColumnConfident
						: undefined
				}
			/>

			<div className="button-bottom">
				<Button
					type="primary"
					disabled={!contentDetail}
					icon={<Icon icon="save" size={16} />}
					onClick={handleOpenModalEditName}
				>
					{jp.common.save}
				</Button>
			</div>

			<RenameContentModal
				isModalOpen={isModalOpen}
				contentName={contentName ?? ""}
				modelId={contentId}
				onContentNameChange={setContentName}
				onCancel={handleCancelEditName}
				operatorType={item?.operatorType}
				operatorId={item?.id}
			/>
		</>
	);
};

export default OutputData;
