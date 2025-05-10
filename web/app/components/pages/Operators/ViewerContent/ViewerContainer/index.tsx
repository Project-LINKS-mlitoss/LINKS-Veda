import { useFetcher } from "@remix-run/react";
import type React from "react";
import {
	type Dispatch,
	type ReactNode,
	type SetStateAction,
	useCallback,
	useEffect,
	useState,
} from "react";
import type { SelectRowIdT } from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import Icon from "~/components/atoms/Icon";
import { DefaultCurrent, DefaultPageSize } from "~/components/molecules/Common";
import WrapViewer from "~/components/molecules/Common/WrapViewer";
import { TableItems } from "~/components/pages/Content/ContentDetail";
import type { DataTableContentType } from "~/components/pages/Content/types";
import ContentViewerOperator from "~/components/pages/Operators/ViewerContent/ContentViewer";
import GISViewer from "~/components/pages/Operators/ViewerContent/GISViewer";
import type { ColumnConfident } from "~/components/pages/Operators/types";
import type { ItemsResponse } from "~/models/items";
import type {
	ApiResponse,
	JsonifyObject,
	SuccessResponse,
} from "~/repositories/utils";
import { routes } from "~/routes/routes";

interface ViewerContainerProps {
	/** When true, the component renders the preview in Contents version;
	 * when false, it renders the selected Operators version. */
	isPreview?: boolean;
	wrapperClassName?: string;
	gisMapClassName?: string;
	tableClassName?: string;
	item: DataTableContentType | undefined;
	hasGeoData: boolean;
	onGISCollapse?: () => void;
	onNavigateDetail?: () => void;
	selectedRowId?: SelectRowIdT | null;
	onSelectRow?: Dispatch<SetStateAction<SelectRowIdT | null>>;
	gisIcon?: ReactNode;
	contentIcon?: ReactNode;
	isPaginationShorten?: boolean;
	setColumnConfident?: (val: ColumnConfident) => void;
}

const ViewerContainer: React.FC<ViewerContainerProps> = ({
	isPreview = true,
	wrapperClassName,
	gisMapClassName,
	tableClassName,
	item,
	hasGeoData,
	selectedRowId,
	isPaginationShorten = false,
	onGISCollapse,
	onNavigateDetail,
	onSelectRow,
	setColumnConfident,
	gisIcon = <Icon icon="folderViewer" size={16} />,
	contentIcon = <Icon icon="swap" size={16} />,
}) => {
	const fetch = useFetcher<ApiResponse<ItemsResponse>>();
	const [fetchData, setFetchData] =
		useState<JsonifyObject<SuccessResponse<ItemsResponse>>>();
	const [pagination, setPagination] = useState({
		page: DefaultCurrent,
		perPage: DefaultPageSize,
	});

	const handleTableChange = useCallback(
		(newPagination: Record<string, string>) => {
			setPagination({
				page: Number.parseInt(newPagination.page, 10),
				perPage: Number.parseInt(newPagination.perPage, 10),
			});
		},
		[],
	);

	useEffect(() => {
		if (item?.id) {
			fetch.load(
				`${routes.item}?modelId=${item?.id}&page=${pagination.page}&perPage=${pagination.perPage}`,
			);
		}
	}, [item?.id, pagination, fetch.load]);

	useEffect(() => {
		if (fetch?.data?.status) {
			setFetchData(fetch.data);
		}
	}, [fetch.data]);
	if (isPreview) {
		if (!item) return null;

		return (
			<div className={`viewer ${wrapperClassName}`}>
				{hasGeoData && (
					<div className={gisMapClassName}>
						<WrapViewer
							title={jp.common.gisViewer}
							icon={gisIcon}
							isShowShrinkOutlined
							onClickShrinkOutlined={onGISCollapse}
						>
							<GISViewer
								key={`${item?.id}-gis`}
								contentItem={item}
								selectedRowId={selectedRowId}
								filter={pagination}
								fetchData={fetchData}
							/>
						</WrapViewer>
					</div>
				)}

				<div className={tableClassName}>
					<WrapViewer
						title={jp.common.gisViewerContentViewer}
						icon={contentIcon}
						isShowShrinkOutlined
						onClickShrinkOutlined={onNavigateDetail}
					>
						<TableItems
							key={`${item?.id}-table`}
							contentDetail={item}
							setSelectedRowId={hasGeoData ? onSelectRow : undefined}
							filter={pagination}
							fetchData={fetchData}
							updateParams={handleTableChange}
						/>
					</WrapViewer>
				</div>
			</div>
		);
	}

	return (
		<div className={wrapperClassName}>
			<WrapViewer
				title={jp.common.gisViewerContentViewer}
				icon={<Icon icon="schema" size={16} />}
				isShowShrinkOutlined
			>
				{hasGeoData && (
					<div className={gisMapClassName}>
						<GISViewer
							key={`${item?.id}-gis`}
							contentItem={item}
							selectedRowId={selectedRowId}
							filter={pagination}
							fetchData={fetchData}
						/>
					</div>
				)}
				<div className={tableClassName}>
					<ContentViewerOperator
						contentItem={item}
						isPaginationShorten={isPaginationShorten}
						isPreview={true}
						setSelectedRowId={hasGeoData ? onSelectRow : undefined}
						filter={pagination}
						fetchData={fetchData}
						updateParams={handleTableChange}
						setColumnConfident={setColumnConfident}
					/>
				</div>
			</WrapViewer>
		</div>
	);
};

export default ViewerContainer;
