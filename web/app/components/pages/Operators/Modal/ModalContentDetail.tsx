import type React from "react";
import { useState } from "react";
import { CONTENT_FIELD_TYPE, type SelectRowIdT } from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import Modal from "~/components/atoms/Modal";
import ViewerContainer from "~/components/pages/Operators/ViewerContent/ViewerContainer";
import { ModalChooseFile } from "~/components/pages/Operators/styles";
import type { ContentItem } from "~/models/content";

interface ModalContentDetailProps {
	isOpen: boolean;
	onCancel: () => void;
	onApply: () => void;
	selectedContent?: ContentItem;
}

const ModalContentDetail: React.FC<ModalContentDetailProps> = ({
	isOpen,
	onCancel,
	onApply,
	selectedContent,
}) => {
	const [selectedRowId, setSelectedRowId] = useState<SelectRowIdT | null>(null);

	const isGeoJson = selectedContent
		? selectedContent?.schema?.fields?.some(
				// No change schema to content because this is data from CMS
				(field) => field?.type === CONTENT_FIELD_TYPE.GEO,
			)
		: false;
	return (
		<Modal
			centered
			open={isOpen}
			onCancel={onCancel}
			title={`${jp.common.content}${jp.modal.detail}`}
			onOk={onApply}
			cancelText={jp.common.cancel}
			okText={jp.common.apply}
			width={640}
		>
			<ModalChooseFile>
				<div className="modal-detail-content">
					<p className="text">{selectedContent?.name}</p>

					<div className="table-detail">
						{selectedContent && (
							<ViewerContainer
								isPreview={false}
								item={selectedContent}
								hasGeoData={isGeoJson}
								wrapperClassName={`viewer ${isGeoJson ? "viewer-geojson" : ""}`}
								gisMapClassName="gis-viewer h-40 b-bottom"
								tableClassName={`content-viewer ${isGeoJson ? "h-60" : "h-100"}`}
								selectedRowId={selectedRowId}
								onSelectRow={isGeoJson ? setSelectedRowId : undefined}
							/>
						)}
					</div>
				</div>
			</ModalChooseFile>
		</Modal>
	);
};

export default ModalContentDetail;
