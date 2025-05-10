import type { Meta, StoryObj } from "@storybook/react";
import List from "app/components/atoms/List";
import type { ReactElement } from "react";

const meta: Meta<typeof List> = {
	title: "Example/List",
	component: List,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData = ["Item 1", "Item 2", "Item 3"];
const sampleDataCustom = [
	{
		avatar: "https://www.w3schools.com/w3images/avatar2.png",
		title: "Item 1",
		desc: "Description for item 1",
	},
	{
		avatar: "https://www.w3schools.com/w3images/avatar1.png",
		title: "Item 2",
		desc: "Description for item 2",
	},
	{
		avatar: "https://www.w3schools.com/w3images/avatar3.png",
		title: "Item 3",
		desc: "Description for item 3",
	},
];

export const Basic: Story = {
	args: {
		size: "small",
		dataSource: sampleData,
	},
	render: (args): ReactElement => (
		<div style={{ width: "300px", backgroundColor: "#f9f9f9" }}>
			<List
				{...args}
				renderItem={(item: unknown) => {
					if (typeof item === "string") {
						return (
							<div style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
								<strong>{item}</strong>
							</div>
						);
					}
					return null;
				}}
			/>
		</div>
	),
};
