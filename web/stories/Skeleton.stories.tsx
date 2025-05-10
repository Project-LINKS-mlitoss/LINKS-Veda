import type { Meta, StoryObj } from "@storybook/react";
import Skeleton from "app/components/atoms/Skeleton";

const meta: Meta<typeof Skeleton> = {
	title: "Example/Skeleton",
	component: Skeleton,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	args: {},
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {
		active: true,
		avatar: true,
		paragraph: { rows: 4 },
		title: true,
	},
	render: (args) => (
		<div style={{ width: "300px" }}>
			<Skeleton {...args} />
		</div>
	),
};
