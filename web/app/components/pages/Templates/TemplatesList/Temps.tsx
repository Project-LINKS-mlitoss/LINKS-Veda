import { useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import Icon from "~/components/atoms/Icon";
import { ListContent } from "~/components/pages/Templates/styles";
import useElementWidth from "~/hooks/useElementWidth";
import {
	type OPERATOR_TYPE,
	type TemplateItem,
	type TemplatesT,
	type WorkflowT,
	operatorTypeToUrlMap,
} from "~/models/templates";
import { theme } from "~/styles/theme";

interface TempProps {
	tempList: TemplateItem;
	setTempChoose: (val: TemplatesT | WorkflowT) => void;
	tempChoose: TemplatesT | WorkflowT | undefined;
	selectedType: OPERATOR_TYPE | null;
	setSelectedType: (val: OPERATOR_TYPE | null) => void;
}

export const Temps = (props: TempProps) => {
	const { tempList, setTempChoose, tempChoose, selectedType, setSelectedType } =
		props;
	const navigate = useNavigate();

	// State
	const [visibleTemps, setVisibleTemps] = useState<TemplatesT[] | WorkflowT[]>(
		[],
	);
	const GAP = 16;
	const maxSize = useElementWidth("wrap-list-content");
	const TEMP_WIDTH = theme.dimensions.tempWidth;

	// Handle calculator how many item show on first line
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!tempList?.temps?.length || maxSize <= 0 || selectedType) return;

		// Width of one temp box
		const availableWidth = Math.max(0, maxSize);
		const maxTempCount = Math.floor(availableWidth / (TEMP_WIDTH + GAP));
		setVisibleTemps(tempList?.temps.slice(0, maxTempCount));
	}, [maxSize, tempList, selectedType]);

	const renderTemps = (temps: TemplatesT[] | WorkflowT[]) => {
		return temps?.map((temp) => (
			<button
				key={temp?.id}
				className={`temp ${temp?.id === tempChoose?.id ? "temp-active" : ""}`}
				onClick={() => setTempChoose(temp)}
				type="button"
			>
				<div>
					<div className="icon">
						<Icon icon={tempList?.icon} size={16} />
					</div>
					<p className="name">{temp?.name}</p>
				</div>
			</button>
		));
	};

	return (
		<ListContent id="wrap-list-content">
			<div className="list-title-action">
				<p className="list-title">{tempList?.title}</p>

				<div className="action">
					<button
						type="button"
						onClick={() =>
							setSelectedType(selectedType ? null : tempList?.type)
						}
					>
						{selectedType ? "戻る" : "すべて表示"}
					</button>
					{!selectedType && (
						<button
							type="button"
							onClick={() =>
								navigate(operatorTypeToUrlMap[tempList?.type as OPERATOR_TYPE])
							}
						>
							新規作成
						</button>
					)}
				</div>
			</div>

			<div className="temps temps-all">
				{renderTemps(selectedType ? tempList?.temps : visibleTemps)}
			</div>
		</ListContent>
	);
};
