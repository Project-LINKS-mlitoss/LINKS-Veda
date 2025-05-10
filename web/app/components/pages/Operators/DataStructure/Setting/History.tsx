import type * as React from "react";
import { CONTENT_CALLBACK_API_STATUS } from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import Icon from "~/components/atoms/Icon";
import { HistoryS } from "~/components/pages/Operators/styles";
import type { ColumnConfident } from "~/components/pages/Operators/types";
import type { ContentConfig } from "~/models/operators";

interface Props {
	data?: ContentConfig | null;
	columnConfident?: ColumnConfident;
}

const History: React.FC<Props> = (props) => {
	const { data, columnConfident } = props;
	const isShowData =
		data?.status === CONTENT_CALLBACK_API_STATUS.DONE ||
		data?.status === CONTENT_CALLBACK_API_STATUS.SAVED;

	const getConfidentClass = (confident: number) => {
		switch (true) {
			case confident === 100:
				return "confident-100";
			case confident >= 70:
				return "confident-70-99";
			case confident >= 40:
				return "confident-40-69";
			default:
				return "confident-0-39";
		}
	};

	return (
		<HistoryS
			isShowData={isShowData}
			isFailed={data?.status === CONTENT_CALLBACK_API_STATUS.FAILED}
		>
			<div className="crossbar title">
				<span>1. 構造化</span>

				<span className="status">
					{isShowData ? (
						<>
							{jp.common.preview} <Icon icon="check" />
						</>
					) : data?.status === CONTENT_CALLBACK_API_STATUS.FAILED ? (
						""
					) : (
						<>
							実行中 <Icon icon="loading" />
						</>
					)}
				</span>
			</div>

			<div className="columns">
				{columnConfident &&
					Object.entries(columnConfident).map(([key, confident], index) => (
						<div
							className={`column crossbar ${getConfidentClass(confident)}`}
							key={key}
						>
							<p className="name">
								1-{index + 1}. {key}
							</p>
							<p className="percent">{confident.toFixed(1)}%</p>
						</div>
					))}
			</div>
		</HistoryS>
	);
};

export default History;
