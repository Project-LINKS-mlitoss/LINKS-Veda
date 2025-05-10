import type { Meta, StoryObj } from "@storybook/react";
import Comment from "app/components/atoms/Comment";

const meta: Meta<typeof Comment> = {
	title: "Example/Comment",
	component: Comment,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	args: {},
} satisfies Meta<typeof Comment>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultAuthor = "John Doe";
const defaultContent = "This is a comment.";
const defaultDatetime = new Date().toISOString();

export const Basic: Story = {
	args: {
		author: defaultAuthor,
		content: defaultContent,
		datetime: defaultDatetime,
	},
};

export const WithAvatar: Story = {
	args: {
		author: defaultAuthor,
		content: defaultContent,
		datetime: defaultDatetime,
		avatar:
			"https://play-lh.googleusercontent.com/g3DtfXccz_yJo9XFhcJsqH_Cmt7XkbtkI0dte3ec7o99O-yAlPIm07f5VZgtjLKdmg",
	},
};

export const LongContent: Story = {
	args: {
		author: defaultAuthor,
		content:
			"This is a longer comment content that spans multiple lines. " +
			"It demonstrates how the component handles longer text and how it looks when the content is more verbose.",
		datetime: defaultDatetime,
	},
};

export const CustomAuthor: Story = {
	args: {
		author: "Custom Author Name",
		content: defaultContent,
		datetime: defaultDatetime,
	},
};
