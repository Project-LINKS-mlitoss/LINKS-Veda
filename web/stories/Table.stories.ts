import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import Table, { type ColumnsType } from "app/components/atoms/Table";

const meta: Meta<typeof Table<RowData>> = {
	title: "Example/Table",
	component: Table,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
	args: { onScroll: fn() },
} satisfies Meta<typeof Table<RowData>>;

export default meta;
type Story = StoryObj<typeof meta>;

type RowData = {
	key: string;
	name: string;
	age: number;
	address: string;
};

const sampleData: RowData[] = [
	{ key: "1", name: "John Doe", age: 32, address: "New York" },
	{ key: "2", name: "Jane Smith", age: 28, address: "London" },
	{ key: "3", name: "Mike Johnson", age: 45, address: "San Francisco" },
];

const columns: ColumnsType<RowData> = [
	{ title: "Name", dataIndex: "name", key: "name" },
	{ title: "Age", dataIndex: "age", key: "age" },
	{ title: "Address", dataIndex: "address", key: "address" },
];

export const Basic: Story = {
	args: {
		dataSource: sampleData,
		columns: columns,
		bordered: true,
		pagination: false,
		rowHoverable: true,
		showHeader: true,
		size: "large",
		rowSelection: {},
	},
};

export const WithPagination: Story = {
	args: {
		...Basic.args,
		pagination: { pageSize: 2 },
	},
};

export const SelectableRows: Story = {
	args: {
		...Basic.args,
		rowSelection: {
			type: "checkbox",
			onChange: (selectedRowKeys) =>
				console.log("Selected row keys:", selectedRowKeys),
		},
	},
};

export const SortableColumns: Story = {
	args: {
		...Basic.args,
		columns: [
			{
				title: "Name",
				dataIndex: "name",
				key: "name",
				sorter: (a, b) => a.name.localeCompare(b.name),
			},
			{
				title: "Age",
				dataIndex: "age",
				key: "age",
				sorter: (a, b) => a.age - b.age,
			},
			{ title: "Address", dataIndex: "address", key: "address" },
		],
	},
};

export const CustomWidth: Story = {
	args: {
		...Basic.args,
		columns: columns.map((col) => ({
			...col,
			width: col.key === "name" ? 150 : 100,
		})),
	},
};
