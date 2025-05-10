import type { Meta, StoryObj } from "@storybook/react";
import Upload, { type UploadProps } from "app/components/atoms/Upload";

const meta: Meta<typeof Upload> = {
	title: "Example/Upload",
	component: Upload,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	args: {},
} satisfies Meta<typeof Upload>;

export default meta;
type Story = StoryObj<typeof meta>;

const uploadProps: UploadProps = {
	name: "file",
	action: "https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload",
	headers: {
		authorization: "authorization-text",
	},
	onChange(info) {
		if (info.file.status !== "uploading") {
			console.log(info.file, info.fileList);
		}
		if (info.file.status === "done") {
			alert(`${info.file.name} file uploaded successfully`);
		} else if (info.file.status === "error") {
			alert(`${info.file.name} file upload failed.`);
		}
	},
};

export const Basic: Story = {
	args: {
		...uploadProps,
		showUploadList: false,
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		customRequest: ({ file, onSuccess }: any) => {
			setTimeout(() => {
				alert(`Custom upload for file: ${file.name}`);
				onSuccess?.({}, file);
			}, 1000);
		},
		children: (
			<button type="button" style={{ padding: "8px 16px" }}>
				Upload File
			</button>
		),
	},
};
