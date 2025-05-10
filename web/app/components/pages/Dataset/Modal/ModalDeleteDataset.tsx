import { Form, useLocation } from "@remix-run/react";
import type React from "react";
import { useMemo } from "react";
import Button from "~/components/atoms/Button";
import Icon from "~/components/atoms/Icon";
import Input from "~/components/atoms/Input";
import Modal from "~/components/atoms/Modal";
import { ModalContent } from "~/components/pages/Content/styles";
import type { DatasetT } from "~/models/dataset";

interface Props {
	isModalDeleteOpen: boolean;
	setIsModalDeleteOpen: (val: boolean) => void;
	datasetItems: DatasetT[];
	isDeleting: boolean;
	setIsDeleting: (val: boolean) => void;
}

const ModalDeleteDataset: React.FC<Props> = ({
	isModalDeleteOpen,
	setIsModalDeleteOpen,
	datasetItems,
	isDeleting,
	setIsDeleting,
}) => {
	const datasetIds = useMemo(
		() => JSON.stringify(datasetItems.map((item) => item.id)),
		[datasetItems],
	);
	const location = useLocation();
	const fullPath = `${location.pathname}${location.search}`;

	return (
		<Modal
			centered
			open={isModalDeleteOpen}
			onCancel={() => setIsModalDeleteOpen(false)}
			title="データセット削除"
			footer={null}
		>
			<ModalContent>
				<div className="modal-item">
					<p className="question">データセットを削除しますか？</p>
					<div className="name">
						<Icon icon="file" size={16} />
						<span>{datasetItems[0]?.name}</span>
					</div>
				</div>

				<Form method="DELETE" className="form" action={fullPath}>
					<Input type="hidden" name="datasetIds" value={datasetIds} />
					<Button
						htmlType="submit"
						type="default"
						name="actionType"
						value="delete"
						key="delete"
						loading={isDeleting}
						onClick={() => setIsDeleting(true)}
					>
						削除
					</Button>
					<Button
						htmlType="button"
						type="primary"
						onClick={() => setIsModalDeleteOpen(false)}
						key="cancel"
					>
						キャンセル
					</Button>
				</Form>
			</ModalContent>
		</Modal>
	);
};

export default ModalDeleteDataset;
