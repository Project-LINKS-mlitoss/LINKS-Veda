import type { Meta, StoryObj } from "@storybook/react";
import Typography from "app/components/atoms/Typography";

const { Title, Paragraph } = Typography;

const meta: Meta<typeof Typography> = {
	title: "Example/Typography",
	component: Typography,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	args: {},
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {
		children: "This is a basic typography example.",
	},
};

export const Custom: Story = {
	args: {},
	render: (args) => (
		<Typography {...args}>
			<Title>Introduction</Title>

			<Paragraph>
				In the process of internal desktop applications development, many
				different design specs and implementations would be involved, which
				might cause designers and developers difficulties and duplication and
				reduce the efficiency of development.
			</Paragraph>
		</Typography>
	),
};
