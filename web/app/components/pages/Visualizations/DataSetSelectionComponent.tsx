import {
	useNavigate,
	useNavigation,
	useParams,
	useSearchParams,
} from "@remix-run/react";
import { Button, Progress, message } from "antd";
import type { ApiResponse } from "~/repositories/utils";
import { links } from "./index";
import {
	VisualizationContainer,
	VisualizationFooterContainer,
	VisualizationHeadingContainer,
	VisualizationHeadingWrapper,
	VisualizationPageContainer,
} from "./styles";

import * as React from "react";
import Icon from "~/components/atoms/Icon";
import { DefaultCurrent, DefaultPageSize } from "~/components/molecules/Common";
import type { ContentItem, ContentResponse } from "~/models/content";
import DataSetTable from "./DataSetTable";
import type { ITableFilter } from "./types";

interface DataSetSelectionComponentProps {
	loaderData: ApiResponse<ContentResponse>;
}

const DataSetSelectionComponent: React.FC<DataSetSelectionComponentProps> = ({
	loaderData,
}) => {
	const { useCaseId } = useParams();
	const models = loaderData?.data?.models || [];
	const totalCount = loaderData?.data?.totalCount || 0;

	const [selectedDataSet, setSelectedDataSet] = React.useState<ContentItem[]>(
		[],
	);
	const navigator = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	const navigation = useNavigation();
	const loading = navigation.state !== "idle";

	const initialFilters: ITableFilter = {
		keyword: searchParams.get("keyword") || "",
		page: Number(searchParams.get("page")) || DefaultCurrent,
		perPage: Number(searchParams.get("perPage")) || DefaultPageSize,
	};
	const [filters, setFilters] = React.useState<ITableFilter>(initialFilters);

	const handleRefetch = React.useCallback(
		(newFilters: ITableFilter) => {
			setSearchParams({
				page: newFilters.page.toString(),
				perPage: newFilters.perPage.toString(),
				keyword: newFilters.keyword,
			});
		},
		[setSearchParams],
	);

	const showWarningMessage = React.useCallback(() => {
		message.config({
			top: 0,
			duration: 5,
			maxCount: 1,
		});
		message.warning({
			content: "少なくとも１つのデータセットを選択してください",
			style: {
				position: "fixed",
				top: 20,
				right: 20,
				transform: "none",
				margin: 0,
			},
		});
	}, []);

	const handleLoadDataSet = React.useCallback(() => {
		if (!selectedDataSet || selectedDataSet.length === 0) {
			return showWarningMessage();
		}

		try {
			// Store all selected datasets
			const selectedDataSetString = JSON.stringify(selectedDataSet);
			localStorage.setItem("userSelectedModels", selectedDataSetString);

			// Merge all selected datasets into one
			const mergedDataSet = {
				...selectedDataSet[0],
				name: `Combined Dataset (${selectedDataSet.length} items)`,
			};

			// Store merged dataset as current
			localStorage.setItem(
				"currentSelectedModel",
				JSON.stringify(mergedDataSet),
			);

			navigator(`/visualizations/${useCaseId}/dashboard`);
		} catch (error) {
			console.error("Error storing selected datasets:", error);
			message.error("Failed to save selected datasets");
		}
	}, [selectedDataSet, showWarningMessage, navigator, useCaseId]);

	const handleBack = React.useCallback(() => {
		navigator("/visualizations");
	}, [navigator]);

	return (
		<VisualizationPageContainer>
			<VisualizationHeadingContainer>
				<VisualizationHeadingWrapper>
					<Icon icon="visualizationLogo" />
					<h1>
						{`EBPM Tools / UC${useCaseId} / ${links.find((link) => link.uc === Number(useCaseId))?.label}`}
					</h1>
				</VisualizationHeadingWrapper>
			</VisualizationHeadingContainer>
			<VisualizationContainer>
				{loading ? (
					<div className="rotate-path">
						<Progress
							type="circle"
							percent={75}
							size={30}
							format={() => null}
							className="process"
						/>
					</div>
				) : (
					<DataSetTable
						data={models}
						setDataSetItems={setSelectedDataSet}
						totalCount={totalCount}
						filters={filters}
						setFilters={setFilters}
						handleRefetch={handleRefetch}
					/>
				)}
			</VisualizationContainer>
			<VisualizationFooterContainer>
				<>
					<Button className="secondary" onClick={handleBack}>
						戻る
					</Button>
					<Button
						type="primary"
						icon={<Icon icon="open" />}
						onClick={handleLoadDataSet}
					>
						Open
					</Button>
				</>
			</VisualizationFooterContainer>
		</VisualizationPageContainer>
	);
};
export default DataSetSelectionComponent;
