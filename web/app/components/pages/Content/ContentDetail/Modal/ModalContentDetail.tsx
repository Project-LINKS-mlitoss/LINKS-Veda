import type React from "react";
import { CONTENT_FIELD_TYPE } from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import Modal from "~/components/atoms/Modal";
import ViewerContainer from "~/components/pages/Operators/ViewerContent/ViewerContainer";
import { ModalChooseFile } from "~/components/pages/Operators/styles";
import type { ContentItem } from "~/models/content";

interface ModalContentDetailProps {
	isOpen: boolean;
	onCancel: () => void;
	onApply: () => void;
	baseContent?: ContentItem;
	selectedContent?: ContentItem;
	isLoadingApply: boolean;
}

const ModalContentDetail: React.FC<ModalContentDetailProps> = ({
	isOpen,
	onCancel,
	onApply,
	baseContent,
	selectedContent,
	isLoadingApply,
}) => {
	const isGeoJson = selectedContent
		? selectedContent?.schema?.fields?.some(
				(field) => field?.type === CONTENT_FIELD_TYPE.GEO,
			)
		: false;
	return (
		<Modal
			centered
			open={isOpen}
			onCancel={onCancel}
			title={jp.modal.insertContentDetail}
			onOk={onApply}
			cancelText={jp.common.cancel}
			okText={jp.common.apply}
			okButtonProps={{
				loading: isLoadingApply,
			}}
			width={640}
		>
			<ModalChooseFile>
				<div className="modal-detail-content">
					<p className="title">対象スキーマ</p>
					<p className="text">{baseContent?.name}</p>

					<div className="table-detail">
						{selectedContent && (
							<ViewerContainer
								isPreview={false}
								item={selectedContent}
								hasGeoData={isGeoJson}
								wrapperClassName={`viewer ${isGeoJson ? "viewer-geojson" : ""}`}
								gisMapClassName="gis-viewer h-40 b-bottom"
								tableClassName={`content-viewer ${isGeoJson ? "h-60" : "h-100"}`}
							/>
						)}
					</div>

					<p className="title">インサートスキーマ</p>
					<p className="text">{selectedContent?.name}</p>
				</div>
			</ModalChooseFile>
		</Modal>
	);
};

export default ModalContentDetail;
