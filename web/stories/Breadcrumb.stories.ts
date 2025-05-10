import type { Meta, StoryObj } from "@storybook/react";
import Breadcrumb from "app/components/atoms/Breadcrumb";

const meta = {
	title: "Example/Breadcrumb",
	component: Breadcrumb,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: {},
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData = [
	{ title: "Home" },
	{ title: "News" },
	{ title: "Today news" },
];

const sampleData2 = [
	{ path: "/home", breadcrumbName: "Home" },
	{
		path: "/news",
		breadcrumbName: "News",
		children: [
			{ path: "/today", breadcrumbName: "Today" },
			{ path: "/hot", breadcrumbName: "Hot" },
		],
	},
];

export const Basic: Story = {
	args: {
		items: sampleData,
	},
};

export const Path: Story = {
	args: {
		routes: sampleData2,
	},
};
