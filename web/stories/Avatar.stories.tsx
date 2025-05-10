import { UserOutlined } from "@ant-design/icons";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import Avatar from "app/components/atoms/Avatar";

const meta = {
	title: "Example/Avatar",
	component: Avatar,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: { onError: fn() },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ImageAvatar: Story = {
	args: {
		src: "https://play-lh.googleusercontent.com/g3DtfXccz_yJo9XFhcJsqH_Cmt7XkbtkI0dte3ec7o99O-yAlPIm07f5VZgtjLKdmg",
		size: 124,
	},
};

export const IconAvatar: Story = {
	args: {
		size: 124,
	},
	render: (args) => (
		<div style={{ height: "200px", display: "flex", flexDirection: "column" }}>
			<Avatar {...args} icon={<UserOutlined />} />
		</div>
	),
};

export const LetterAvatar: Story = {
	args: {
		size: 124,
	},
	render: (args) => (
		<div style={{ height: "200px", display: "flex", flexDirection: "column" }}>
			<Avatar {...args}>My avatar</Avatar>
		</div>
	),
};
