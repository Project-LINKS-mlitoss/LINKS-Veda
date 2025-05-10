import styled from "@emotion/styled";
import { theme } from "~/styles/theme";

import Button, { type ButtonProps } from "app/components/atoms/Button";
import ConfigProvider from "app/components/atoms/ConfigProvider";

const StyledButton = styled(Button)`
    text-decoration: underline;
`;

const UnderlineButton: React.FC<ButtonProps> = (props) => (
	<ConfigProvider
		theme={{
			components: {
				Button: {
					paddingInline: 0,
					contentFontSize: Number.parseInt(theme.fontSize.medium, 10),
					textTextColor: theme.colors.transparentGray,
					textTextHoverColor: theme.colors.transparentGray,
					textHoverBg: "none",
				},
			},
		}}
	>
		<StyledButton {...props} type="text" />
	</ConfigProvider>
);

export default UnderlineButton;
