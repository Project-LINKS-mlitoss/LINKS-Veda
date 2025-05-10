import axios from "axios";
import { useState } from "react";
import { BATCH_SIZE } from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Icon from "~/components/atoms/Icon";
import type { ContentItem } from "~/models/content";
import type { Item, ItemsResponse } from "~/models/items";
import type { ApiResponse } from "~/repositories/utils";
import ModalChooseContent from "./ModalChooseContent";
import ModalContentDetail from "./ModalContentDetail";

type InsertRowModalProps = {
	onAddRow: (initialValue: Item[]) => void;
	isGeoJson: boolean;
	baseContent: ContentItem;
};

export function InsertRowModal({
	onAddRow,
	isGeoJson,
	baseContent,
}: InsertRowModalProps) {
	// State
	const [isModalChooseContentOpen, setIsModalChooseContentOpen] =
		useState(false);
	const [isModalDetailContentOpen, setIsModalDetailContentOpen] =
		useState(false);
	const [tempSelectedContent, setTempSelectedContent] = useState<
		ContentItem | undefined
	>();
	const [isLoadingApply, setIsLoadingApply] = useState(false);

	// Handle function
	const handleOpenModalDetailContent = () => {
		setIsModalDetailContentOpen(true);
	};

	const handleApply = async () => {
		if (!tempSelectedContent) {
			console.warn("No content selected.");
			return;
		}

		const allItems: Item[] = [];
		const perPage = 100;
		let totalCount = 0;

		try {
			setIsLoadingApply(true);
			const initialResponse = await axios.get<ApiResponse<ItemsResponse>>(
				"/items",
				{
					params: {
						modelId: tempSelectedContent?.id,
						page: 1,
						perPage: perPage,
					},
				},
			);

			if (initialResponse?.data?.status) {
				totalCount = initialResponse?.data?.data?.totalCount || 0;
				allItems.push(...initialResponse.data.data.items);

				const totalPages = Math.ceil(totalCount / perPage);
				const batchSize = BATCH_SIZE.SMALL;
				const batches = [];

				for (let i = 2; i <= totalPages; i += batchSize) {
					const batch = [];
					for (let j = i; j < i + batchSize && j <= totalPages; j++) {
						batch.push(
							axios.get<ApiResponse<ItemsResponse>>("/items", {
								params: { modelId: tempSelectedContent?.id, page: j, perPage },
							}),
						);
					}
					batches.push(batch);
				}

				for (const batch of batches) {
					const results = await Promise.allSettled(batch);
					for (const result of results) {
						if (result?.status === "fulfilled" && result?.value?.data?.status) {
							allItems.push(...result.value.data.data.items);
						}
					}
				}
			}

			if (allItems?.length > 0) {
				onAddRow(allItems);
			}
			setIsModalDetailContentOpen(false);
			setIsModalChooseContentOpen(false);
		} catch (error) {
			console.error("Error fetching items:", error);
		} finally {
			setIsLoadingApply(false);
		}
	};

	return (
		<>
			<Button
				icon={<Icon icon="columnSchema" size={16} />}
				onClick={() => setIsModalChooseContentOpen(true)}
			>
				{jp.common.insertRow}
			</Button>

			<ModalChooseContent
				isOpen={isModalChooseContentOpen}
				onCancel={() => setIsModalChooseContentOpen(false)}
				onOk={handleOpenModalDetailContent}
				tempSelectedContent={tempSelectedContent}
				setTempSelectedContent={setTempSelectedContent}
				selectedContent={tempSelectedContent}
				isOnlyJson={!isGeoJson}
				isOnlyGeojson={isGeoJson}
			/>

			<ModalContentDetail
				isOpen={isModalDetailContentOpen}
				onCancel={() => setIsModalDetailContentOpen(false)}
				onApply={handleApply}
				selectedContent={tempSelectedContent}
				baseContent={baseContent}
				isLoadingApply={isLoadingApply}
			/>
		</>
	);
}
