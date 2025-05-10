import type { Meta, StoryObj } from "@storybook/react";
import Row from "antd/lib/row";
import Col from "app/components/atoms/Col";

const meta = {
	title: "Example/Col",
	component: Col,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof Col>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	render: () => (
		<Row gutter={16}>
			<Col
				span={6}
				style={{
					backgroundColor: "#e0f7fa",
					padding: "10px",
					textAlign: "center",
				}}
			>
				Col span 6
			</Col>
			<Col
				span={12}
				style={{
					backgroundColor: "#ffe0b2",
					padding: "10px",
					textAlign: "center",
				}}
			>
				Col span 12
			</Col>
			<Col
				span={18}
				style={{
					backgroundColor: "#c8e6c9",
					padding: "10px",
					textAlign: "center",
				}}
			>
				Col span 18
			</Col>
			<Col
				span={24}
				style={{
					backgroundColor: "#ffccbc",
					padding: "10px",
					textAlign: "center",
				}}
			>
				Col span 24
			</Col>
		</Row>
	),
};

export const WithOffset: Story = {
	render: () => (
		<Row gutter={16}>
			<Col
				span={8}
				offset={4}
				style={{
					backgroundColor: "#e0f7fa",
					padding: "10px",
					textAlign: "center",
				}}
			>
				Col span 8, offset 4
			</Col>
			<Col
				span={12}
				offset={6}
				style={{
					backgroundColor: "#ffe0b2",
					padding: "10px",
					textAlign: "center",
				}}
			>
				Col span 12, offset 6
			</Col>
			<Col
				span={6}
				offset={12}
				style={{
					backgroundColor: "#c8e6c9",
					padding: "10px",
					textAlign: "center",
				}}
			>
				Col span 6, offset 12
			</Col>
		</Row>
	),
};

export const Responsive: Story = {
	render: () => (
		<Row gutter={16}>
			<Col
				xs={24}
				sm={12}
				md={8}
				style={{
					backgroundColor: "#e0f7fa",
					padding: "10px",
					textAlign: "center",
				}}
			>
				Responsive Col 1
			</Col>
			<Col
				xs={24}
				sm={12}
				md={8}
				style={{
					backgroundColor: "#ffe0b2",
					padding: "10px",
					textAlign: "center",
				}}
			>
				Responsive Col 2
			</Col>
			<Col
				xs={24}
				sm={12}
				md={8}
				style={{
					backgroundColor: "#c8e6c9",
					padding: "10px",
					textAlign: "center",
				}}
			>
				Responsive Col 3
			</Col>
			<Col
				xs={24}
				sm={12}
				md={8}
				style={{
					backgroundColor: "#ffccbc",
					padding: "10px",
					textAlign: "center",
				}}
			>
				Responsive Col 4
			</Col>
		</Row>
	),
};
