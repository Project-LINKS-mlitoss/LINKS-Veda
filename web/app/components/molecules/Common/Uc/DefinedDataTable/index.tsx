import Table from "~/components/atoms/Table";
import Tabs from "~/components/atoms/Tabs";
import type { ContentItem } from "~/models/content";
import type { ModelItem } from "~/models/models";

interface DefinedDataPanelProps {
	storedModel: ModelItem | null;
	selectedModels: ContentItem[];
	setActiveModel: (id: string) => void;
	definedDataColumns: {
		title: string;
		dataIndex: string;
		key: string;
	}[];
	definedDataSource: {
		[key: string]: React.Key;
		key: string;
	}[];
}
const DefinedDataPanel: React.FC<DefinedDataPanelProps> = ({
	storedModel,
	selectedModels,
	setActiveModel,
	definedDataColumns,
	definedDataSource,
}) => {
	return (
		<div className="m-3 h-[84vh] bg-white flex-1 padding-[16px] overflow-auto">
			<div className="ml-4">
				<Tabs
					defaultActiveKey={storedModel?.id || selectedModels[0]?.id}
					onChange={(key: string) => setActiveModel(key)}
					items={selectedModels.map((model) => ({
						label: model.name,
						key: model.id,
					}))}
				/>
			</div>

			<Table
				columns={definedDataColumns}
				dataSource={definedDataSource}
				pagination={false}
				rowKey="key"
			/>
		</div>
	);
};

export default DefinedDataPanel;
