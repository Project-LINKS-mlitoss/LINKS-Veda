import type * as React from "react";
import jp from "~/commons/locales/jp";
import Icon from "~/components/atoms/Icon";
import WrapViewer from "~/components/molecules/Common/WrapViewer";
import { TemplatePreviewS } from "~/components/pages/Templates/styles";
import { MODE_TEMPLATE } from "~/components/pages/Templates/types";
import {
	OPERATOR_TYPE,
	type TemplatesT,
	type WorkflowT,
} from "~/models/templates";
import CrossTabAddCol from "../TemplateCreateEdit/CrossTab/CrossTabAddCol";
import DataStructureAddCol from "../TemplateCreateEdit/DataStructure/DataStructureAddCol";
import PreProcessingAddOption from "../TemplateCreateEdit/PreProcessing/PreProcessingAddOption";
import SpatialAggregationAdding from "../TemplateCreateEdit/SpatialAggregation/SpatialAggregationAdding";
import SpatialJoinAddContent from "../TemplateCreateEdit/SpatialJoin/SpatialJoinAddContent";
import TextMatchingAddContent from "../TemplateCreateEdit/TextMatching/TextMatchingAddContent";

type Props = {
	tempChoose: TemplatesT | WorkflowT | undefined;
	onClickShrinkOutlined?: () => void;
};

const TemplatePreview: React.FC<Props> = ({
	tempChoose,
	onClickShrinkOutlined,
}) => {
	if (!tempChoose) return null;

	return (
		<WrapViewer
			title={jp.common.preview}
			icon={<Icon icon="templateBox" size={16} />}
			isShowShrinkOutlined
			onClickShrinkOutlined={onClickShrinkOutlined}
		>
			<TemplatePreviewS>
				<div className="name">{tempChoose.name}</div>

				{"workflowDetails" in tempChoose
					? (tempChoose as WorkflowT).workflowDetails?.map((item) => {
							return renderPreviewComponent(item);
						})
					: renderPreviewComponent(tempChoose)}
			</TemplatePreviewS>
		</WrapViewer>
	);
};

export default TemplatePreview;

// biome-ignore lint/suspicious/noExplicitAny: FIXME
export const renderPreviewComponent = (tempChoose: any, isActive?: boolean) => {
	const tempChooseTemplatesT = tempChoose as TemplatesT;
	const { operatorType, configJson } = tempChooseTemplatesT;

	switch (operatorType) {
		case OPERATOR_TYPE.DATA_STRUCTURE:
			return (
				<DataStructureAddCol
					data={configJson}
					mode={MODE_TEMPLATE.USE}
					isActive={isActive}
				/>
			);
		case OPERATOR_TYPE.PRE_PROCESSING:
			return (
				<PreProcessingAddOption
					data={configJson}
					mode={MODE_TEMPLATE.USE}
					isActive={isActive}
				/>
			);
		case OPERATOR_TYPE.TEXT_MATCHING:
			return (
				<TextMatchingAddContent
					data={configJson}
					mode={MODE_TEMPLATE.USE}
					isActive={isActive}
				/>
			);
		case OPERATOR_TYPE.CROSS_TAB:
			return (
				<CrossTabAddCol
					data={configJson}
					mode={MODE_TEMPLATE.USE}
					isActive={isActive}
				/>
			);
		case OPERATOR_TYPE.SPATIAL_JOIN:
			return (
				<SpatialJoinAddContent
					contentIdLeft=""
					data={configJson}
					mode={MODE_TEMPLATE.USE}
					isActive={isActive}
				/>
			);
		case OPERATOR_TYPE.SPATIAL_AGGREGATE:
			return (
				<SpatialAggregationAdding
					data={configJson}
					mode={MODE_TEMPLATE.USE}
					isActive={isActive}
				/>
			);
		default:
			return null;
	}
};
