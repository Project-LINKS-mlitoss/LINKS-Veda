import type { Meta, StoryObj } from "@storybook/react";
import { Button, Input, Radio, Select } from "antd";
import Form from "app/components/atoms/Form";

const { Option } = Select;

const meta: Meta<typeof Form> = {
	title: "Example/Form",
	component: Form,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	render: (args) => (
		<Form
			{...args}
			onFinish={(values) =>
				alert(`Form submitted with values: ${JSON.stringify(values)}`)
			}
			style={{
				width: "100%",
				maxWidth: "500px",
				margin: "auto",
				padding: "24px",
			}}
		>
			<Form.Item
				name="input1"
				label="Input value"
				labelCol={{ span: 8 }}
				wrapperCol={{ span: 16 }}
			>
				<Input placeholder="Enter password..." />
			</Form.Item>
			<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
				<Button type="primary" htmlType="submit">
					Submit
				</Button>
			</Form.Item>
		</Form>
	),
	args: {
		title: "Basic Form",
	},
};

export const WithMultipleInputs: Story = {
	render: (args) => (
		<Form
			{...args}
			onFinish={(values) =>
				alert(
					`Form with multiple inputs submitted with values: ${JSON.stringify(
						values,
					)}`,
				)
			}
			style={{
				width: "100%",
				maxWidth: "500px",
				margin: "auto",
				padding: "24px",
			}}
		>
			<Form.Item
				name="input1"
				label="First Name"
				labelCol={{ span: 8 }}
				wrapperCol={{ span: 16 }}
			>
				<Input placeholder="Enter your first name" />
			</Form.Item>
			<Form.Item
				name="input2"
				label="Last Name"
				labelCol={{ span: 8 }}
				wrapperCol={{ span: 16 }}
			>
				<Input placeholder="Enter your last name" />
			</Form.Item>
			<Form.Item
				name="input3"
				label="Email"
				labelCol={{ span: 8 }}
				wrapperCol={{ span: 16 }}
			>
				<Input type="email" placeholder="Enter your email" />
			</Form.Item>
			<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
				<Button type="primary" htmlType="submit">
					Submit
				</Button>
			</Form.Item>
		</Form>
	),
	args: {
		title: "Form with Multiple Inputs",
	},
};

export const WithRadioAndSelect: Story = {
	render: (args) => (
		<Form
			{...args}
			onFinish={(values) =>
				alert(
					`Form with Radio and Select submitted with values: ${JSON.stringify(
						values,
					)}`,
				)
			}
			style={{
				width: "100%",
				maxWidth: "600px",
				margin: "auto",
				padding: "24px",
			}}
		>
			<Form.Item
				name="radioGroup"
				label="Choose an option"
				labelCol={{ span: 8 }}
				wrapperCol={{ span: 16 }}
			>
				<Radio.Group>
					<Radio value="option1">Option 1</Radio>
					<Radio value="option2">Option 2</Radio>
					<Radio value="option3">Option 3</Radio>
				</Radio.Group>
			</Form.Item>
			<Form.Item
				name="select"
				label="Select an option"
				labelCol={{ span: 8 }}
				wrapperCol={{ span: 16 }}
			>
				<Select placeholder="Select an option">
					<Option value="option1">Option 1</Option>
					<Option value="option2">Option 2</Option>
					<Option value="option3">Option 3</Option>
				</Select>
			</Form.Item>
			<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
				<Button type="primary" htmlType="submit">
					Submit
				</Button>
			</Form.Item>
		</Form>
	),
	args: {
		title: "Form with Radio and Select",
	},
};

export const LargeForm: Story = {
	render: (args) => (
		<Form
			{...args}
			onFinish={(values) =>
				alert(`Large form submitted with values: ${JSON.stringify(values)}`)
			}
			style={{
				width: "100%",
				maxWidth: "800px",
				margin: "auto",
				height: "400px",
				padding: "24px",
			}}
		>
			<Form.Item
				name="input1"
				label="First Name"
				labelCol={{ span: 8 }}
				wrapperCol={{ span: 16 }}
			>
				<Input placeholder="Enter your first name" />
			</Form.Item>
			<Form.Item
				name="input2"
				label="Last Name"
				labelCol={{ span: 8 }}
				wrapperCol={{ span: 16 }}
			>
				<Input placeholder="Enter your last name" />
			</Form.Item>
			<Form.Item
				name="email"
				label="Email"
				labelCol={{ span: 8 }}
				wrapperCol={{ span: 16 }}
			>
				<Input type="email" placeholder="Enter your email" />
			</Form.Item>
			<Form.Item
				name="radioGroup"
				label="Gender"
				labelCol={{ span: 8 }}
				wrapperCol={{ span: 16 }}
			>
				<Radio.Group>
					<Radio value="male">Male</Radio>
					<Radio value="female">Female</Radio>
					<Radio value="other">Other</Radio>
				</Radio.Group>
			</Form.Item>
			<Form.Item
				name="select"
				label="Country"
				labelCol={{ span: 8 }}
				wrapperCol={{ span: 16 }}
			>
				<Select placeholder="Select your country">
					<Option value="usa">USA</Option>
					<Option value="canada">Canada</Option>
					<Option value="uk">UK</Option>
				</Select>
			</Form.Item>
			<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
				<Button type="primary" htmlType="submit">
					Submit
				</Button>
			</Form.Item>
		</Form>
	),
	args: {
		title: "Large Form with Various Inputs",
	},
};

export const FormWithCustomStyles: Story = {
	render: (args) => (
		<Form
			{...args}
			onFinish={(values) =>
				alert(
					`Form with custom styles submitted with values: ${JSON.stringify(
						values,
					)}`,
				)
			}
			style={{
				width: "100%",
				maxWidth: "600px",
				margin: "auto",
				backgroundColor: "#f0f0f0",
				padding: "24px",
				borderRadius: "8px",
			}}
		>
			<Form.Item
				name="input1"
				label="First Name"
				labelCol={{ span: 8 }}
				wrapperCol={{ span: 16 }}
			>
				<Input placeholder="Enter your first name" />
			</Form.Item>
			<Form.Item
				name="input2"
				label="Last Name"
				labelCol={{ span: 8 }}
				wrapperCol={{ span: 16 }}
			>
				<Input placeholder="Enter your last name" />
			</Form.Item>
			<Form.Item
				name="select"
				label="Role"
				labelCol={{ span: 8 }}
				wrapperCol={{ span: 16 }}
			>
				<Select placeholder="Select your role">
					<Option value="admin">Admin</Option>
					<Option value="user">User</Option>
					<Option value="guest">Guest</Option>
				</Select>
			</Form.Item>
			<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
				<Button type="primary" htmlType="submit">
					Submit
				</Button>
			</Form.Item>
		</Form>
	),
	args: {
		title: "Form with Custom Styles",
	},
};
