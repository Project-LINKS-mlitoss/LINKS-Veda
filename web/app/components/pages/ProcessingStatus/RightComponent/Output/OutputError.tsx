import type * as React from "react";
import jp from "~/commons/locales/jp";
import type { DataTableProcessingStatusType } from "~/models/processingStatus";
import type { MbFile } from "~/repositories/mbRepository";

interface Props {
	item: DataTableProcessingStatusType | undefined;
}

const OutputError: React.FC<Props> = (props) => {
	const { item } = props;

	return (
		<div className="generate-error">
			{item &&
			"error" in item &&
			Array.isArray(item?.error) &&
			item.error.length > 0 ? (
				<div>
					<h3>Errors:</h3>
					{item.error.map((err: MbFile) => (
						<div className="error" key={err.fileId || item?.ticketId}>
							{err.fileId ? (
								<p>
									<strong>File {jp.common.id}:</strong> {err.fileId}
								</p>
							) : null}
							<p>
								<strong>Message:</strong> {err.message}
							</p>
						</div>
					))}
				</div>
			) : (
				jp.message.operator.generateError
			)}
		</div>
	);
};

export default OutputError;
