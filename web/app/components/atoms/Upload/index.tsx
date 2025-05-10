import { type GetProp, Upload } from "antd";
import type {
	UploadFile as ANTDFileUpload,
	UploadChangeParam,
	UploadProps,
} from "antd/lib/upload/interface";

// biome-ignore lint/suspicious/noExplicitAny: FIXME
interface UploadFile<T = any> extends ANTDFileUpload<T> {
	skipDecompression?: boolean;
}

export default Upload;
export type { UploadChangeParam, UploadFile, UploadProps, GetProp };
