import { Progress } from "antd";
import type * as React from "react";
import Icon from "~/components/atoms/Icon";
import type { DataTableProcessingStatusType } from "~/models/processingStatus";

interface Props {
	item: DataTableProcessingStatusType;
}

const Loading: React.FC<Props> = ({ item }) => {
	const step = "step" in item ? Number.parseInt(item.step as string) : 0;
	const stepCount =
		"stepCount" in item ? Number.parseInt(item.stepCount as string) : 0;
	return (
		<div className="wrap-loading">
			<div className="loading">
				<div className="rotate-path">
					<Progress
						type="circle"
						percent={75}
						format={() => null}
						className="process"
					/>
				</div>

				{"isInExecution" in item && item.isInExecution ? (
					<p className="step">
						<Icon icon={"templateBox"} />
						<span>
							ワークフロー（{step}/{stepCount}）
						</span>
					</p>
				) : null}

				<p className="note">
					ワークフローが進行中です。
					直前のオペレーション完了後にインプットが入力されます。
				</p>
			</div>
		</div>
	);
};

export default Loading;
