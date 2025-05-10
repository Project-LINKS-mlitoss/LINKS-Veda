import type { ParamsType } from "@ant-design/pro-provider";
import ProTable, {
	type ListToolBarProps,
	type ProTableProps,
} from "@ant-design/pro-table";
import type { OptionConfig } from "@ant-design/pro-table/lib/components/ToolBar";
import type {
	ProColumns,
	TableRowSelection,
} from "@ant-design/pro-table/lib/typing";
import { ConfigProvider } from "antd";
import jaJPIntl from "antd/lib/locale/ja_JP";

export type Props = ProTableProps<
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	Record<string, any> | any,
	ParamsType,
	"text"
>;

const Table: React.FC<Props> = (props) => {
	return (
		<ConfigProvider locale={jaJPIntl}>
			<ProTable {...props} />
		</ConfigProvider>
	);
};

export type StretchColumn<T> = ProColumns<T> & { minWidth: number };

export default Table;
export type {
	ProTableProps,
	ListToolBarProps,
	ProColumns,
	OptionConfig,
	TableRowSelection,
	ParamsType,
};
