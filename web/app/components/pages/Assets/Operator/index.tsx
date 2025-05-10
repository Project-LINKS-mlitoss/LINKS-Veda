import type * as React from "react";
import Button from "~/components/atoms/Button";
import Icon from "~/components/atoms/Icon";
import WrapViewer from "~/components/molecules/Common/WrapViewer";
import { OperatorS } from "../styles";

interface OperatorProps {
	isPreview: boolean;
	previewType: number;
}

const Operator: React.FC<OperatorProps> = ({ isPreview, previewType }) => {
	let buttonText = "";
	let buttonIcon = "";

	switch (previewType) {
		case 1:
			buttonText = "データ構造化";
			buttonIcon = "strucOrigin";
			break;
		case 2:
			buttonText = "結合前処理";
			buttonIcon = "preBindingProcessing";
			break;
		case 3:
			buttonText = "原票ZIP構造化";
			buttonIcon = "strucOrigin";
			break;
		default:
			break;
	}

	return (
		<WrapViewer title="Operator" icon={<Icon icon="swap" size={16} />}>
			<OperatorS>
				{isPreview && (
					<div className="struc-origin">
						<Button htmlType="button" icon={<Icon icon={buttonIcon} />}>
							{buttonText}
						</Button>
					</div>
				)}
			</OperatorS>
		</WrapViewer>
	);
};

export default Operator;
