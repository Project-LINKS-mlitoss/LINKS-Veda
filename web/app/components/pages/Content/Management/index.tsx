import {
	Link,
	useLocation,
	useNavigate,
	useParams,
	useSubmit,
} from "@remix-run/react";
import type * as React from "react";
import { useEffect, useState } from "react";
import {
	CHAT_CALLBACK_API_STATUSES_NO_REFETCH,
	CHAT_STATUS,
	CONTENT_MANAGEMENT_PUBLISH,
	CONTENT_MANAGEMENT_STATUS,
	CONTENT_MANAGEMENT_STATUS_TYPE,
	OPERATOR_FETCH_TIMEOUT,
} from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Icon from "~/components/atoms/Icon";
import Switch from "~/components/atoms/Switch";
import WrapViewer from "~/components/molecules/Common/WrapViewer";
import { formatDateToUTC } from "~/components/molecules/Common/utils";
import MetaData from "~/components/pages/Content/Management/MetaData";
import StatusTag from "~/components/pages/Content/UploadStatusTag";
import { ManagementS } from "~/components/pages/Content/styles";
import type { DataTableContentType } from "~/components/pages/Content/types";
import { useFetcherWithReset } from "~/hooks/useFetcherWithReset";
import {
	ACTION_TYPES_CONTENT,
	CONTENT_ASSET_TYPE,
	type ContentItem,
	type ContentResponse,
} from "~/models/content";
import type { ContentChatI } from "~/models/contentChatModel";
import type { ContentMetaData } from "~/models/contentMetadataModel";
import type { ApiResponse, SuccessResponse } from "~/repositories/utils";
import { routes } from "~/routes/routes";

export function Management({
	isPreview,
	contentDetail,
	setContentItems,
	setInitData,
}: {
	isPreview: boolean;
	contentDetail: DataTableContentType | ContentItem;
	setContentItems: (val: (prevItems: ContentItem[]) => ContentItem[]) => void;
	setInitData?: (val: (prevItems: ContentResponse) => ContentResponse) => void;
}) {
	// Remix
	const { contentId } = useParams();
	const submit = useSubmit();
	const navigate = useNavigate();
	const location = useLocation();
	const fullPath = `${location.pathname}${location.search}`;
	const [chatItem, setChatItem] = useState<ContentChatI | undefined>();
	const chatFetcher = useFetcherWithReset<ApiResponse<ContentChatI>>();
	let timeoutId: string | number | NodeJS.Timeout | undefined;

	// State
	const [isPublic, setIsPublish] = useState<boolean>(false);
	const [isPublicVisualize, setIsPublishVisualize] = useState<boolean>(false);
	const [isPublishing, setIsPublishing] = useState<boolean>(false);
	const [isPublishingVisualize, setIsPublishingVisualize] =
		useState<boolean>(false);
	const [metadata, setMetaData] = useState<ContentMetaData>({ title: "" });

	// Check variable
	const isChatDone = contentDetail?.chat?.status === CHAT_STATUS.DONE;
	const isPublishAvailable = !!(
		contentDetail?.management?.assetUrl ||
		contentDetail?.management?.status === CONTENT_MANAGEMENT_PUBLISH.PUBLISH
	);
	const isContentInProgress =
		contentDetail?.management?.publicStatus ===
			CONTENT_MANAGEMENT_STATUS.IN_PROGRESS || false;

	const isPublishAvailableVisualize = !!(
		contentDetail?.visualize?.assetUrl ||
		contentDetail?.visualize?.status === CONTENT_MANAGEMENT_PUBLISH.PUBLISH
	);
	const isContentInProgressVisualize =
		contentDetail?.visualize?.publicStatus ===
			CONTENT_MANAGEMENT_STATUS.IN_PROGRESS || false;

	const isParentContent = contentDetail?.duplicateContent?.id;
	const isDuplicateContent =
		contentDetail &&
		contentDetail.management &&
		contentDetail.management.parentContentId &&
		contentDetail.management.parentContentId !== null;
	const isDisplayLink =
		contentDetail && (isParentContent || isDuplicateContent);
	const linkTitle = isDisplayLink
		? contentDetail.duplicateContent
			? contentDetail.duplicateContent?.name
			: contentDetail.management?.name
		: "";
	const linkSrc = isDisplayLink
		? isParentContent
			? contentDetail.duplicateContent?.contentId ?? ""
			: contentDetail.management?.parentContentId ?? ""
		: "";

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		setIsPublishing(false);
		setIsPublishingVisualize(false);
		setIsPublish(
			contentDetail?.management?.status === CONTENT_MANAGEMENT_PUBLISH.PUBLISH,
		);
		setIsPublishVisualize(
			contentDetail?.visualize?.status === CONTENT_MANAGEMENT_PUBLISH.PUBLISH,
		);

		// Update latest data if create asset/visualize success
		const metadataJson = contentDetail?.metadata?.metadataJson;
		if (metadataJson) setMetaData(JSON.parse(metadataJson as string));

		if (
			contentDetail?.chat?.chatId &&
			contentDetail?.chat?.status &&
			!CHAT_CALLBACK_API_STATUSES_NO_REFETCH.includes(
				contentDetail?.chat?.status,
			)
		) {
			setChatItem(contentDetail?.chat);
		}
		chatFetcher.reset();
	}, [contentDetail]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		// Don't need to fetch detail if in the detail screen
		if (isPreview && !contentId) fetchContentDetail();
	}, [isPreview]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		const hasNoChat = !chatItem;
		const hasNoChatId = !chatItem?.chatId;
		const isStatusNoRefetch =
			chatItem?.status &&
			CHAT_CALLBACK_API_STATUSES_NO_REFETCH.includes(chatItem.status);
		if (hasNoChat || hasNoChatId) return;
		if (isStatusNoRefetch) {
			setContentItems((prevItems): ContentItem[] => {
				const updatedItems = [...prevItems];
				updatedItems[0] = {
					...contentDetail,
					chat: chatItem,
				};

				return updatedItems;
			});
			if (chatItem?.status === CHAT_STATUS.DONE && setInitData) {
				setInitData((prevData) => {
					const targetIndex = prevData.models.findIndex(
						(model) => model.id === contentDetail.id,
					);

					if (targetIndex !== -1) {
						const updatedModels = [...prevData.models];

						updatedModels[targetIndex] = {
							...updatedModels[targetIndex],
							types: Array.isArray(updatedModels[targetIndex].types)
								? [
										...new Set([
											...updatedModels[targetIndex].types,
											CONTENT_MANAGEMENT_STATUS_TYPE.CHAT,
										]),
									]
								: [CONTENT_MANAGEMENT_STATUS_TYPE.CHAT],
						};

						return {
							...prevData,
							models: updatedModels,
						};
					}

					return prevData;
				});
			}
			chatFetcher.reset();
			clearTimeout(timeoutId);
			return;
		}

		timeoutId = setTimeout(() => {
			chatFetcher.load(`${routes.chatStatus}/${chatItem?.chatId}`);
		}, OPERATOR_FETCH_TIMEOUT);

		return () => clearTimeout(timeoutId);
	}, [chatItem]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		const data = chatFetcher?.data as SuccessResponse<ContentChatI>;
		// NOTE: Not update data if data is old fetcher data
		if (data?.status && data.data.chatId === chatItem?.chatId) {
			setChatItem(data.data);
		}
	}, [chatFetcher.data]);

	const fetchContentDetail = async () => {
		if (contentDetail) {
			try {
				const response = await fetch(
					routes.contentDetailModel(contentDetail.contentId),
				);
				const data = await response.json();
				if (data?.status) {
					setContentItems((prevItems): ContentItem[] => {
						const updatedItems = [...prevItems];
						updatedItems[0] = {
							...contentDetail,
							management: data.data.management,
							duplicateContent: data.data.duplicateContent,
							metadata: data.data.metadata,
							datasets: data.data.datasets,
						};

						return updatedItems;
					});
					const metadataJson = data.data?.metadata?.metadataJson;
					setMetaData(
						metadataJson
							? JSON.parse(metadataJson as string)
							: (prevState: ContentMetaData | undefined) =>
									({
										issued: contentDetail?.createdAt,
										modified: contentDetail?.updatedAt,
									}) as ContentMetaData,
					);
				}
			} catch (error) {
				console.error("Failed to fetch model data", error);
			}
		}
	};

	const getAssetTextByType = (type: CONTENT_ASSET_TYPE) => {
		const detail = contentDetail[type];

		if (!detail) return "作成";

		if (detail.publicStatus === CONTENT_MANAGEMENT_STATUS.IN_PROGRESS)
			return "作成中";

		return detail.assetUrl ? "再作成" : "作成";
	};

	const getChatBtnText = () => {
		if (!contentDetail.chat) return "作成";
		if (contentDetail.chat.status === CHAT_STATUS.IN_PROGRESS) return "作成中";

		return contentDetail.chat.chatId &&
			contentDetail.chat.status !== CHAT_STATUS.FAILED
			? "再作成"
			: "作成";
	};

	const handleGenerateAsset = () => {
		if (
			isPublic ||
			contentDetail.management?.publicStatus ===
				CONTENT_MANAGEMENT_STATUS.IN_PROGRESS
		)
			return;

		setContentItems((prevItems): ContentItem[] => {
			const updatedItems = [...prevItems];
			const { management, metadata: oldMetadata, ...rest } = updatedItems[0];
			updatedItems[0] = {
				...contentDetail,
				management: {
					...management,
					contentId: contentDetail.id,
					publicStatus: CONTENT_MANAGEMENT_STATUS.IN_PROGRESS,
					assetId: management?.assetId ?? null,
					assetUrl: management?.assetUrl ?? null,
					parentContentId: management?.parentContentId ?? null,
				},
				metadata: {
					...oldMetadata,
					metadataJson: JSON.stringify(metadata),
				},
				...rest,
			};

			return updatedItems;
		});
		const formData = new FormData();
		formData.append("_action", ACTION_TYPES_CONTENT.CREATE_ASSET);
		formData.append("contentId", contentDetail.id);
		formData.append("metaData", JSON.stringify(metadata));

		submit(formData, { method: "post", action: fullPath });
	};

	const handleGenerateAssetVisualize = () => {
		if (
			isPublicVisualize ||
			contentDetail.visualize?.publicStatus ===
				CONTENT_MANAGEMENT_STATUS.IN_PROGRESS
		)
			return;

		setContentItems((prevItems): ContentItem[] => {
			const updatedItems = [...prevItems];
			const { visualize, metadata: oldMetadata, ...rest } = updatedItems[0];
			updatedItems[0] = {
				...contentDetail,
				visualize: {
					...visualize,
					contentId: contentDetail.id,
					publicStatus: CONTENT_MANAGEMENT_STATUS.IN_PROGRESS,
					assetId: visualize?.assetId ?? null,
					assetUrl: visualize?.assetUrl ?? null,
				},
				metadata: {
					...oldMetadata,
					metadataJson: JSON.stringify(metadata),
				},
				...rest,
			};

			return updatedItems;
		});
		const formData = new FormData();
		formData.append("_action", ACTION_TYPES_CONTENT.CREATE_ASSET_VISUALIZE);
		formData.append("contentId", contentDetail.id);
		formData.append("metaData", JSON.stringify(metadata));

		submit(formData, { method: "post", action: fullPath });
	};

	const handleGenerateChat = () => {
		if (contentDetail.chat?.status === CHAT_STATUS.IN_PROGRESS) return;

		const newChat = {
			...contentDetail.chat,
			chatId: undefined,
			status: CHAT_STATUS.IN_PROGRESS,
		};
		setContentItems((prevItems): ContentItem[] => {
			const updatedItems = [...prevItems];
			updatedItems[0] = {
				...contentDetail,
				chat: newChat,
			};

			return updatedItems;
		});
		setChatItem(chatItem);
		const formData = new FormData();
		formData.append("_action", ACTION_TYPES_CONTENT.CREATE_CHAT);
		formData.append("contentId", contentDetail.id);
		submit(formData, { method: "post", action: fullPath });
	};

	const handlePublic = () => {
		if (!isPublishAvailable || isPublishing) return;

		setIsPublishing(true);
		setIsPublish(!isPublic);
		const formData = new FormData();
		formData.append("_action", ACTION_TYPES_CONTENT.PUBLISH);
		formData.append("contentId", contentDetail.id);
		formData.append(
			"isPublish",
			isPublic
				? CONTENT_MANAGEMENT_PUBLISH.UN_PUBLISH
				: CONTENT_MANAGEMENT_PUBLISH.PUBLISH,
		);

		submit(formData, { method: "post", action: fullPath });
	};

	const handlePublicVisualize = () => {
		if (!isPublishAvailableVisualize || isPublishingVisualize) return;

		setIsPublishingVisualize(true);
		setIsPublishVisualize(!isPublicVisualize);
		const formData = new FormData();
		formData.append("_action", ACTION_TYPES_CONTENT.PUBLISH_VISUALIZE);
		formData.append("contentId", contentDetail.id);
		formData.append(
			"isPublish",
			isPublicVisualize
				? CONTENT_MANAGEMENT_PUBLISH.UN_PUBLISH
				: CONTENT_MANAGEMENT_PUBLISH.PUBLISH,
		);

		submit(formData, { method: "post", action: fullPath });
	};

	if (!isPreview) return null;

	return (
		<WrapViewer
			title={jp.common.management}
			icon={<Icon icon="management" size={16} />}
		>
			<ManagementS>
				<div className="management-item">
					<p className="management-item-title">{jp.common.publishStatus}</p>
					<div className="status">
						{(isDuplicateContent || !isDisplayLink) && (
							<StatusTag
								status={CONTENT_MANAGEMENT_STATUS_TYPE.PUBLIC}
								style={{ textAlign: "center" }}
								isActive={isPublic}
							/>
						)}
						{(isParentContent || !isDisplayLink) && (
							<StatusTag
								status={CONTENT_MANAGEMENT_STATUS_TYPE.VISUALIZE}
								style={{ textAlign: "center" }}
								isActive={isPublicVisualize}
							/>
						)}
						<StatusTag
							status={CONTENT_MANAGEMENT_STATUS_TYPE.CHAT}
							style={{ textAlign: "center" }}
							isActive={isChatDone}
						/>
					</div>
				</div>
				<MetaData
					contentDetail={contentDetail}
					metaData={metadata}
					setMetaData={setMetaData}
				/>
				{isDisplayLink && (
					<div className="management-item">
						<p className="management-item-title">
							{isDuplicateContent ? "複製元コンテンツ" : "複製先コンテンツ"}
						</p>
						<div className="management-item-link">
							<Link title={linkTitle} to={routes.contentDetail(linkSrc)}>
								{linkTitle}
							</Link>
						</div>
					</div>
				)}

				{(!isDisplayLink || isDuplicateContent) && (
					<div className="management-item">
						<p className="management-item-title">オープンデータ</p>
						<p className="management-item-title">
							データ作成
							<div className="data-creation-wrapper">
								{isPublishAvailable && !isContentInProgress && (
									<Icon
										icon="checkComplete"
										size={22}
										style={{ paddingRight: "5px" }}
									/>
								)}
								<Button
									onClick={handleGenerateAsset}
									disabled={isPublic || isPublishing}
									type={
										contentDetail.management?.publicStatus ===
										CONTENT_MANAGEMENT_STATUS.IN_PROGRESS
											? "link"
											: undefined
									}
								>
									{`\u200B${getAssetTextByType(CONTENT_ASSET_TYPE.MANAGEMENT)}`}
								</Button>
							</div>
						</p>
						<p className="management-item-title">
							データ公開
							<Switch
								disabled={!isPublishAvailable}
								checked={isPublic}
								onChange={handlePublic}
							/>
						</p>
						<div className="wrap-link-item">
							<LinkItem url={contentDetail.management?.assetUrl ?? undefined} />
						</div>
					</div>
				)}

				{(!isDisplayLink || isParentContent) && (
					<div className="management-item">
						<p className="management-item-title">可視化利用</p>
						<p className="management-item-title">
							データ作成
							<div className="data-creation-wrapper">
								{isPublishAvailableVisualize &&
									!isContentInProgressVisualize && (
										<Icon
											icon="checkComplete"
											size={22}
											style={{ paddingRight: "5px" }}
										/>
									)}
								<Button
									onClick={handleGenerateAssetVisualize}
									disabled={isPublicVisualize || isPublishingVisualize}
									type={
										contentDetail.visualize?.publicStatus ===
										CONTENT_MANAGEMENT_STATUS.IN_PROGRESS
											? "link"
											: undefined
									}
								>
									{`\u200B${getAssetTextByType(CONTENT_ASSET_TYPE.VISUALIZE)}`}
								</Button>
							</div>
						</p>
						<p className="management-item-title">
							データ公開
							<Switch
								disabled={!isPublishAvailableVisualize}
								checked={isPublicVisualize}
								onChange={handlePublicVisualize}
							/>
						</p>
						<div className="wrap-link-item">
							<LinkItem url={contentDetail.visualize?.assetUrl ?? undefined} />
						</div>
					</div>
				)}

				<div className="management-item">
					<p className="management-item-title">チャット利用</p>
					<p className="management-item-title">
						ベクトルデータ作成
						<div className="data-creation-wrapper">
							{isChatDone && (
								<Icon
									icon="checkComplete"
									size={22}
									style={{ paddingRight: "5px" }}
								/>
							)}
							<Button
								onClick={handleGenerateChat}
								type={
									contentDetail.chat?.status === CHAT_STATUS.IN_PROGRESS
										? "link"
										: undefined
								}
							>
								{`\u200B${getChatBtnText()}`}
							</Button>
						</div>
					</p>
				</div>

				<div className="management-item update">
					<p className="management-item-title">{jp.common.updatedTime}</p>
					<p className="update-info">
						{contentId
							? formatDateToUTC(contentDetail?.updatedAt, "/")
							: contentDetail && "updatedAtTime" in contentDetail
								? contentDetail.updatedAtTime
								: null}
					</p>

					<p className="management-item-title">{jp.common.updatedBy}</p>
					<p className="update-info">{contentDetail?.createdBy ?? "N/A"}</p>
					<p className="management-item-title">利用データセット</p>
					{contentDetail?.datasets?.map((dataset) => (
						<p
							className="management-item-title dataset-item"
							key={dataset?.dataset?.id}
						>
							<Button
								onClick={() =>
									navigate(`${routes.dataset}/${dataset?.dataset?.id}`)
								}
								icon={<Icon icon="link" size={16} />}
							>
								<span className="dataset-name" title={dataset?.dataset?.name}>
									{dataset?.dataset?.name}
								</span>
							</Button>
						</p>
					))}
				</div>
			</ManagementS>
		</WrapViewer>
	);
}

export const LinkItem = ({ url }: { url?: string }) => {
	const [isCopied, setIsCopied] = useState(false);
	const handleCopy = (url?: string) => {
		if (!url) return;

		navigator.clipboard.writeText(url);
		setIsCopied(true);
	};

	return (
		<div className="link-item">
			<span
				className="link-item-name"
				title={url ?? "http://cms.veda.com/dasdf"}
			>
				{url ?? "http://cms.veda.com/dasdf"}
			</span>
			<Icon
				className={url ? "cursor-pointer" : "cursor-default"}
				icon={isCopied ? "checkComplete" : "copy"}
				size={14}
				onClick={() => handleCopy(url)}
			/>
		</div>
	);
};
