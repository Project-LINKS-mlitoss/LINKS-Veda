import ContentSection from "app/components/atoms/InnerContents/ContentSection";
import InnerContent from "app/components/atoms/InnerContents/basic";
import DangerZone from "app/components/molecules/WorkspaceSettings/DangerZone";
import WorkspaceGeneralForm from "app/components/molecules/WorkspaceSettings/GeneralForm";

interface Props {
	workspaceName?: string;
	updateWorkspaceLoading: boolean;
	onWorkspaceUpdate: (name: string) => Promise<void>;
	onWorkspaceDelete: () => Promise<void>;
}

const WorkspaceSettings: React.FC<Props> = ({
	workspaceName,
	updateWorkspaceLoading,
	onWorkspaceUpdate,
	onWorkspaceDelete,
}) => {
	return (
		<InnerContent title="ワークスペース設定">
			<ContentSection title="一般">
				<WorkspaceGeneralForm
					workspaceName={workspaceName}
					updateWorkspaceLoading={updateWorkspaceLoading}
					onWorkspaceUpdate={onWorkspaceUpdate}
				/>
			</ContentSection>
			<DangerZone onWorkspaceDelete={onWorkspaceDelete} />
		</InnerContent>
	);
};

export default WorkspaceSettings;
