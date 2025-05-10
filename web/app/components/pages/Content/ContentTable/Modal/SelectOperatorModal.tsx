import { useNavigate } from "@remix-run/react";
import type React from "react";
import { CONTENT_FIELD_TYPE } from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Modal from "~/components/atoms/Modal";
import { ModalContent } from "~/components/pages/Content/styles";
import type { DataTableContentType } from "~/components/pages/Content/types";
import { routes } from "~/routes/routes";

interface RenameContentModalProps {
	isModalSelectOperatorOpen: boolean;
	setIsModalSelectOperatorOpen: (val: boolean) => void;
	contentItem: DataTableContentType;
}

const SelectOperatorModal: React.FC<RenameContentModalProps> = ({
	isModalSelectOperatorOpen,
	setIsModalSelectOperatorOpen,
	contentItem,
}) => {
	const navigate = useNavigate();
	const isGeoJson = contentItem
		? contentItem?.schema?.fields?.some(
				(field) => field?.type === CONTENT_FIELD_TYPE.GEO,
			)
		: false;

	const generatePathWithParams = (
		path: string,
		queryParams?: Record<string, string | boolean>,
	) => {
		const url = new URL(path, window.location.origin);
		url.searchParams.set("contentInputId", contentItem?.id ?? "");

		if (queryParams) {
			for (const [key, value] of Object.entries(queryParams)) {
				url.searchParams.set(key, String(value));
			}
		}

		return url.pathname + url.search;
	};

	const operatorGroups = [
		{
			title: "結合前処理",
			operators: [
				{
					label: "データクレンジング",
					path: routes.operatorPreProcessing,
					disabled: false,
				},
				{
					label: "ジオコーディング",
					path: routes.operatorPreProcessing,
					queryParams: { geoCoding: true },
					disabled: false,
				},
			],
		},
		{
			title: "結合処理",
			operators: [
				{
					label: "テキストマッチング",
					path: routes.operatorTextMatching,
					disabled: false,
				},
				{ label: "クロス集計", path: routes.operatorCrossTab, disabled: false },
				{
					label: "空間結合",
					path: routes.operatorSpatialJoin,
					disabled: !isGeoJson,
				},
				{
					label: "空間集計",
					path: routes.operatorSpatialAggregation,
					disabled: !isGeoJson,
				},
			],
		},
	];

	return (
		<Modal
			centered
			open={isModalSelectOperatorOpen}
			onCancel={() => setIsModalSelectOperatorOpen(false)}
			title={`${jp.common.operator}${jp.modal.select}`}
			footer={null}
		>
			<ModalContent>
				{operatorGroups.map((group) => (
					<div className="modal-item" key={group.title}>
						<p className="question">{group.title}</p>
						<div className="edit-modal">
							{group.operators.map((operator) => (
								<Button
									key={operator.path}
									htmlType="button"
									type="default"
									disabled={operator.disabled}
									onClick={() =>
										navigate(
											generatePathWithParams(
												operator.path,
												operator.queryParams,
											),
										)
									}
								>
									{operator.label}
								</Button>
							))}
						</div>
					</div>
				))}
			</ModalContent>
		</Modal>
	);
};

export default SelectOperatorModal;
