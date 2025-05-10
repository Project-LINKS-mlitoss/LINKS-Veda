import type * as React from "react";
import { useState } from "react";
import jp from "~/commons/locales/jp";
import Icon from "~/components/atoms/Icon";
import Tabs from "~/components/atoms/Tabs";
import WrapViewer from "~/components/molecules/Common/WrapViewer";
import History from "~/components/pages/Operators/DataStructure/Setting/History";
import type { ContentConfig } from "~/models/operators";
import {
	type DataTableProcessingStatusType,
	PREPROCESSING_TYPE,
} from "~/models/processingStatus";
import { RightComponentS } from "../styles";
import InputOperator from "./Input";
import Output from "./Output";

const { TabPane } = Tabs;

interface Props {
	item: DataTableProcessingStatusType | undefined;
	isPreview: boolean;
	onClickShrinkOutlined?: () => void;
}

const RightComponent: React.FC<Props> = (props) => {
	const { item, isPreview, onClickShrinkOutlined } = props;
	const [columnConfident, setColumnConfident] = useState<{
		[key: string]: number;
	}>({});
	const isContentCreationRecord =
		item?.operatorType === PREPROCESSING_TYPE.CONTENT_CREATION;

	return (
		<WrapViewer
			title="処理詳細"
			icon={<Icon icon="swap" size={16} />}
			isShowShrinkOutlined
			onClickShrinkOutlined={onClickShrinkOutlined}
		>
			<RightComponentS>
				{item && isPreview && !isContentCreationRecord && "ticketId" in item ? (
					<p className="ticket-id">
						Ticket {jp.common.id}: <span>{item?.ticketId}</span>
					</p>
				) : null}

				<Tabs defaultActiveKey="3" type="card">
					<TabPane tab={jp.operator.input} key="1">
						{isPreview && <InputOperator data={item} />}
					</TabPane>
					{!isContentCreationRecord && (
						<>
							<TabPane tab={jp.common.history} key="2">
								{isPreview &&
								item?.operatorType === PREPROCESSING_TYPE.CONTENT_CONFIGS &&
								columnConfident ? (
									<History
										data={item as ContentConfig}
										columnConfident={columnConfident}
										key={item?.id}
									/>
								) : null}
							</TabPane>
							<TabPane tab={jp.common.output} key="3">
								{isPreview && (
									<Output item={item} setColumnConfident={setColumnConfident} />
								)}
							</TabPane>
						</>
					)}
				</Tabs>
			</RightComponentS>
		</WrapViewer>
	);
};

export default RightComponent;
