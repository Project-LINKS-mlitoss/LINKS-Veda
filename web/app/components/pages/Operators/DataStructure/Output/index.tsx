import {
	Link,
	useActionData,
	useFetcher,
	useNavigate,
	useParams,
	useSearchParams,
} from "@remix-run/react";
import { Progress } from "antd";
import type * as React from "react";
import { useEffect, useState } from "react";
import {
	CONTENT_CALLBACK_API_STATUS,
	CONTENT_FIELD_TYPE,
} from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Icon from "~/components/atoms/Icon";
import notification from "~/components/atoms/Notification";
import WrapViewer from "~/components/molecules/Common/WrapViewer";
import RenameContentModal from "~/components/pages/Operators/Modal/ModalRenameContent";
import ViewerContainer from "~/components/pages/Operators/ViewerContent/ViewerContainer";
import {
	OperatorsErrorDetail,
	OutputContentName,
	OutputOperatorS,
} from "~/components/pages/Operators/styles";
import type { ColumnConfident } from "~/components/pages/Operators/types";
import type { ContentItem, ContentResponse } from "~/models/content";
import { ACTION_TYPES_OPERATOR, type ContentConfig } from "~/models/operators";
import { PREPROCESSING_TYPE } from "~/models/processingStatus";
import { type OPERATOR_TYPE, operatorTypeToUrlMap } from "~/models/templates";
import type { MbFile } from "~/repositories/mbRepository";
import type { ApiResponse } from "~/repositories/utils";
import { routes } from "~/routes/routes";

interface Props {
	data?: ContentConfig | null;
	setColumnConfident?: (val: ColumnConfident) => void;
	onClickShrinkOutlined?: () => void;
}

const OutputOperator: React.FC<Props> = (props) => {
	const { data, setColumnConfident, onClickShrinkOutlined } = props;
	const isWorkflow = data?.workflow;

	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const operatorIdTemplate = searchParams.get("operatorId");

	const { operatorId } = useParams();
	const actionData = useActionData<ApiResponse<ContentResponse>>();
	const fetchContentsDetail = useFetcher<ApiResponse<ContentItem>>();

	const isShowData =
		data?.status === CONTENT_CALLBACK_API_STATUS.DONE ||
		data?.status === CONTENT_CALLBACK_API_STATUS.SAVED;

	const [contentDetail, setContentDetail] = useState<ContentItem>();
	const [contentName, setContentName] = useState<string>();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const isGeoJson = contentDetail
		? contentDetail?.schema?.fields?.some(
				// No change schema to content because this is data from CMS
				(field) => field?.type === CONTENT_FIELD_TYPE.GEO,
			)
		: false;

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

	const handleNextWorkflow = () => {
		if (data?.workflowDetailExecutionNextStep) {
			navigate(
				`${
					operatorTypeToUrlMap[
						data?.workflowDetailExecutionNextStep?.operatorType as OPERATOR_TYPE
					]
				}/${data?.workflowDetailExecutionNextStep?.operatorId}`,
			);
		}
	};

	// Effect
	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (data) {
			fetchContentsDetail.load(`${routes.content}/${data?.modelId}`);
		}
	}, [data]);

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
		}
	}, [actionData]);

	return (
		<WrapViewer
			title={jp.operator.output}
			icon={<Icon icon="output" size={16} />}
			isShowShrinkOutlined
			onClickShrinkOutlined={onClickShrinkOutlined}
			content={
				contentDetail ? (
					<OutputContentName>{contentDetail?.name}</OutputContentName>
				) : null
			}
		>
			<OutputOperatorS>
				{(operatorId || operatorIdTemplate) &&
					(isShowData ? (
						<>
							<ViewerContainer
								isPreview={false}
								item={contentDetail}
								hasGeoData={isGeoJson}
								wrapperClassName="viewer"
								gisMapClassName="gis-viewer h-40 b-bottom"
								tableClassName={`content-viewer ${isGeoJson ? "h-60" : "h-100"}`}
								setColumnConfident={setColumnConfident}
							/>

							<div className="button-bottom">
								{isWorkflow ? (
									<Button
										type="primary"
										icon={<Icon icon="save" size={16} />}
										disabled={!data?.workflowDetailExecutionNextStep}
										onClick={handleNextWorkflow}
									>
										Next
									</Button>
								) : (
									<Button
										type="primary"
										disabled={!contentDetail}
										icon={<Icon icon="save" size={16} />}
										onClick={handleOpenModalEditName}
									>
										{jp.common.save}
									</Button>
								)}
							</div>
						</>
					) : data?.status === CONTENT_CALLBACK_API_STATUS.FAILED ? (
						<div className="generate-error">
							{Array.isArray(data?.error) && data.error.length > 0 && (
								<div>
									<h3>Errors:</h3>
									{data.error.map((err: MbFile) => (
										<OperatorsErrorDetail key={err.fileId}>
											<p>
												<strong>File {jp.common.id}:</strong> {err.fileId}
											</p>
											<p>
												<strong>Message:</strong> {err.message}
											</p>
										</OperatorsErrorDetail>
									))}
								</div>
							)}
						</div>
					) : (
						<div className="wrap-processing-generate">
							<div className="processing-generate">
								<div className="rotate-path">
									<Progress
										type="circle"
										percent={75}
										format={() => null}
										className="process"
									/>
								</div>

								{isWorkflow ? (
									<p className="step">
										<Icon icon={"templateBox"} />
										<span>
											ワークフロー（{data?.workflowDetailExecution?.step}/
											{data?.workflow?.workflowDetails?.length}）
										</span>
									</p>
								) : null}

								<p className="note">
									データを処理しています。
									<br /> 一度、ページを離れても
									<Link to={routes.processingStatus}>「処理状況一覧」</Link>
									から再度、
									<br />
									この画面にアクセスすることが可能です。
								</p>
							</div>
						</div>
					))}

				<RenameContentModal
					isModalOpen={isModalOpen}
					contentName={contentName ?? ""}
					modelId={data?.modelId}
					onContentNameChange={setContentName}
					onCancel={handleCancelEditName}
					operatorType={PREPROCESSING_TYPE.CONTENT_CONFIGS}
					operatorId={data?.id}
				/>
			</OutputOperatorS>
		</WrapViewer>
	);
};

export default OutputOperator;
