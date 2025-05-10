import type { Meta, StoryObj } from "@storybook/react";
import Tag from "app/components/atoms/Tag";

const meta: Meta<typeof Tag> = {
	title: "Example/Tag",
	component: Tag,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	args: {},
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {
		color: "red",
	},
	render: (args) => (
		<Tag {...args} onClose={() => console.log("Tag closed")}>
			Tag
		</Tag>
	),
};

export const CustomColor: Story = {
	args: {
		color: "blue",
	},
	render: (args) => (
		<Tag {...args} onClose={() => console.log("Tag closed")}>
			Tag
		</Tag>
	),
};

export const Closable: Story = {
	args: {
		color: "green",
		closable: true,
	},
	render: (args) => (
		<Tag {...args} onClose={() => console.log("Tag closed")}>
			Closable Tag
		</Tag>
	),
};

export const WithIcon: Story = {
	args: {
		color: "orange",
		icon: <span>🌟</span>,
	},
	render: (args) => <Tag {...args}>Tag with Icon</Tag>,
};
