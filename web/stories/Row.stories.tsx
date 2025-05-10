import type { Meta, StoryObj } from "@storybook/react";
import Row from "app/components/atoms/Row";

const meta: Meta<typeof Row> = {
	title: "Example/Row",
	component: Row,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
	args: {},
} satisfies Meta<typeof Row>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {
		children: (
			<>
				<div style={{ backgroundColor: "#e0e0e0", padding: "16px", flex: 1 }}>
					Column 1
				</div>
				<div style={{ backgroundColor: "#b0b0b0", padding: "16px", flex: 1 }}>
					Column 2
				</div>
				<div style={{ backgroundColor: "#808080", padding: "16px", flex: 1 }}>
					Column 3
				</div>
			</>
		),
	},
	render: (args) => (
		<Row {...args} style={{ display: "flex" }}>
			{args.children}
		</Row>
	),
};

export const DifferentColumnSizes: Story = {
	args: {
		children: (
			<>
				<div style={{ backgroundColor: "#e0e0e0", padding: "16px", flex: 1 }}>
					Column 1
				</div>
				<div style={{ backgroundColor: "#b0b0b0", padding: "16px", flex: 2 }}>
					Column 2
				</div>
				<div style={{ backgroundColor: "#808080", padding: "16px", flex: 1 }}>
					Column 3
				</div>
			</>
		),
	},
	render: (args) => (
		<Row {...args} style={{ display: "flex" }}>
			{args.children}
		</Row>
	),
};

export const SpacingBetweenColumns: Story = {
	args: {
		children: (
			<>
				<div
					style={{
						backgroundColor: "#e0e0e0",
						padding: "16px",
						marginRight: "16px",
					}}
				>
					Column 1
				</div>
				<div
					style={{
						backgroundColor: "#b0b0b0",
						padding: "16px",
						marginRight: "16px",
					}}
				>
					Column 2
				</div>
				<div style={{ backgroundColor: "#808080", padding: "16px" }}>
					Column 3
				</div>
			</>
		),
	},
	render: (args) => (
		<Row {...args} style={{ display: "flex" }}>
			{args.children}
		</Row>
	),
};
