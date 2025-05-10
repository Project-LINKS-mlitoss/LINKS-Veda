import type * as React from "react";
import { CONTENT_CALLBACK_API_STATUS } from "~/commons/core.const";
import type { ColumnConfident } from "~/components/pages/Operators/types";
import { OutputS } from "~/components/pages/ProcessingStatus/styles";
import type { DataTableProcessingStatusType } from "~/models/processingStatus";
import Loading from "./Loading";
import OutputData from "./OutputData";
import OutputError from "./OutputError";

interface Props {
	item: DataTableProcessingStatusType | undefined;
	setColumnConfident?: (val: ColumnConfident) => void;
}

const Output: React.FC<Props> = (props) => {
	const { item, setColumnConfident } = props;
	const isShowData =
		item?.status === CONTENT_CALLBACK_API_STATUS.DONE ||
		item?.status === CONTENT_CALLBACK_API_STATUS.SAVED;

	return (
		<OutputS>
			{item &&
				(isShowData ? (
					<OutputData item={item} setColumnConfident={setColumnConfident} />
				) : item?.status === CONTENT_CALLBACK_API_STATUS.FAILED ? (
					<OutputError item={item} />
				) : (
					<Loading item={item} />
				))}
		</OutputS>
	);
};

export default Output;
