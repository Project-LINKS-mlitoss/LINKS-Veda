import { LinkText } from "~/components/molecules/Chart/Customization/style";
import type { PreRequestFormData } from "~/components/pages/Visualizations/UC14/UFN001v2/components/Filters/types";
interface ResetButtonProps {
	resetFields: (keyof PreRequestFormData)[];
	handleResetFields: (fields: (keyof PreRequestFormData)[]) => void;
}
const ResetButton: React.FC<ResetButtonProps> = ({
	handleResetFields,
	resetFields,
}) => {
	return (
		<LinkText>
			<span onClick={() => handleResetFields(resetFields)} onKeyDown={() => {}}>
				リセット
			</span>
		</LinkText>
	);
};

export default ResetButton;
