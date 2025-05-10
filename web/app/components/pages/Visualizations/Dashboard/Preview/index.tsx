import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { theme } from "~/styles/theme";

import { useFetcher, useNavigate, useParams } from "@remix-run/react";
import Modal from "app/components/atoms/Modal";
import Icon from "~/components/atoms/Icon";
import CollapsibleWrapper from "~/components/molecules/Common/CollapsibleView";
import WrapContent from "~/components/molecules/Common/WrapContent";
import Sidebar from "~/components/molecules/Sidebar";

import type { Feature, FeatureCollection, Point } from "geojson";
import type maplibregl from "maplibre-gl";
import type { ZoneConfig } from "~/commons/area.const";
import ChartsViewer from "~/components/molecules/Chart/ChartsViewer";
import Filters from "~/components/molecules/Chart/Customization/Filter";
import type {
	FieldType,
	FilterFormData,
} from "~/components/molecules/Chart/Customization/type";
import type { ChartType } from "~/components/molecules/Chart/types";
import { useOptimizedGeoData } from "~/hooks/useOptimizedGeoData";
import type { Item, ItemsResponse } from "~/models/items";
import type { ModelItem } from "~/models/models";
import type { ApiResponse } from "~/repositories/utils";
import CustomizedMap from "../../CustomizedMap";
import type { MapLayerKey } from "../../types";
import { MapContainer, StickyCharts, VisualizationContainer } from "./styled";
import type { ChartsFormType } from "./types";

const generateChartId = (title: string, type: ChartType): string => {
	return `chart-${type}-${title}-${Date.now()}`;
};

type AccidentFeature = Feature<
	Point,
	{
		番号: string;
		発生日時: string;
		発生場所: string;
		運航者: string;
		型式: string;
		製造者名_2: string;
		出発地: string;
		目的地: string;
		報告の概要: string;
		人の死傷状況: string;
	}
>;

interface Props {
	modelId: string;
}

const VisualizationsComponent: React.FC<Props> = ({ modelId }) => {
	const [selectedLayer, setSelectedLayer] = useState<MapLayerKey>("reference");
	const [activeZoneConfig, setActiveZoneConfig] = useState<ZoneConfig | null>(
		null,
	);
	const [selectedAccident, setSelectedAccident] = useState<
		AccidentFeature | undefined
	>(undefined);
	const { geoJsonData, geometries, isLoading } =
		useOptimizedGeoData(activeZoneConfig);

	const modelFetch = useFetcher<ApiResponse<ModelItem>>();
	const modelItemsFetch = useFetcher<ApiResponse<ItemsResponse>>();
	const { useCaseId } = useParams();
	const navigator = useNavigate();

	const [modelData, setModelData] = useState<ModelItem | null>();
	const [itemsData, setItemsData] = useState<Item[]>([]);
	const [loading, setLoading] = useState(true);

	const [charts, setCharts] = useState<ChartsFormType[]>([]);
	const [selectedChart, setSelectedChart] = useState<ChartsFormType | null>(
		null,
	);
	const [isEditingMode, setIsEditingMode] = useState(false);

	const useNormalizeData = useCallback((items: Item[]) => {
		return items.map((item: Item) => {
			// biome-ignore lint/suspicious/noExplicitAny: FIXME
			const normalized: Record<string, any> = {};
			for (const field of item.fields) {
				normalized[field.key] = field.value;
			}
			return normalized;
		});
	}, []);

	const handleAddChart = (formData: ChartsFormType) => {
		const { id, ...restFormData } = formData;
		const newChart: ChartsFormType = {
			id:
				id ||
				generateChartId(formData.title || "title", formData.type || "pie"),
			...restFormData,
			isSelected: false,
			createdAt: Date.now(),
		};

		setCharts((prev) => [...prev, newChart as ChartsFormType]);
		setSelectedChart(null);
		setIsEditingMode(false);
	};

	const handleOverwriteChart = (formData: ChartsFormType) => {
		if (!selectedChart) return;

		setCharts((prev) =>
			prev.map((chart) =>
				chart.id === selectedChart.id
					? {
							...chart,
							...formData,
							isSelected: false,
							id: generateChartId(formData.title, formData.type),
						}
					: chart,
			),
		);
		setSelectedChart(null);
		setIsEditingMode(false);
	};

	const handleDeleteChart = (chartId: string) => {
		Modal.confirm({
			title: "チャートを削除",
			content: "このチャートを削除してもよろしいですか？",
			okText: "削除",
			cancelText: "キャンセル",
			okButtonProps: { danger: true },
			onOk: () => {
				setCharts((prev) => prev.filter((chart) => chart.id !== chartId));
				if (selectedChart?.id === chartId) {
					setSelectedChart(null);
					setIsEditingMode(false);
				}
			},
		});
	};

	const handleChartSelect = (chartId: string) => {
		const chart = charts.find((c) => c.id === chartId);
		if (chart) {
			setCharts((prev) =>
				prev.map((c) => ({
					...c,
					isSelected: c.id === chartId,
				})),
			);
			setSelectedChart(chart);
			setIsEditingMode(true);
		}
	};

	const fields = useMemo(() => {
		return modelData?.schema?.fields?.map((field) => field.key) as FieldType[];
	}, [modelData]);

	// useEffect(() => {
	// 	setLoading(true);
	// 	const userSelectedModels = JSON.parse(
	// 		localStorage.getItem("userSelectedModels") || "null",
	// 	);
	// 	const modelFromLocalStorage = userSelectedModels.find(
	// 		(model: ModelItem) => model.id === modelId,
	// 	);
	// 	if (modelFromLocalStorage) {
	// 		setModelData(modelFromLocalStorage);
	// 	} else {
	// 		modelFetch.load(`/models/${modelId}`);
	// 	}
	// 	modelItemsFetch.load(`/items?modelId=${modelId}&page=1&perPage=1000`);
	// }, [modelId, modelFetch.load, modelItemsFetch.load]);

	useEffect(() => {
		if (modelFetch?.data?.status) {
			const modelRes = modelFetch?.data?.data;
			setModelData(modelRes);
		}
	}, [modelFetch.data]);

	useEffect(() => {
		if (modelItemsFetch?.data?.status) {
			const modelItemsRes = modelItemsFetch?.data?.data;
			setItemsData(modelItemsRes.items);
		}
	}, [modelItemsFetch.data]);

	useEffect(() => {
		if (modelData && itemsData.length > 0) {
			setLoading(false);
		}
	}, [modelData, itemsData]);

	return (
		<WrapContent
			breadcrumbItems={[
				{
					href: `/visualizations/${useCaseId}/dashboard`,
					title: (
						<>
							<Icon icon="chartBar" size={24} color={theme.colors.semiBlack} />
							<span>{modelData?.name || ""}</span>
						</>
					),
				},
			]}
		>
			<MapContainer>
				<VisualizationContainer>
					<Sidebar
						title="グラフカスタマイズ"
						initialWidth={340}
						onBackClick={() =>
							navigator(`/visualizations/${useCaseId}/dashboard`)
						}
					>
						<Filters
							fields={fields}
							initialValues={selectedChart}
							isEditing={isEditingMode}
							onSubmit={handleAddChart}
							onOverwrite={handleOverwriteChart}
							onDelete={() =>
								selectedChart && handleDeleteChart(selectedChart.id)
							}
						/>
					</Sidebar>

					<CustomizedMap
						selectedLayer={selectedLayer}
						onLayerChange={setSelectedLayer}
						activeZoneConfig={activeZoneConfig}
						setActiveZoneConfig={setActiveZoneConfig}
						onAccidentSelect={setSelectedAccident}
						markers={
							useCaseId === "16"
								? (geometries as FeatureCollection<Point> | undefined)
								: undefined
						}
						polygonData={
							useCaseId === "14"
								? (geometries as FeatureCollection<Point> | undefined)
								: undefined
						}
						geoJsonData={geoJsonData || undefined}
					/>

					<StickyCharts>
						<CollapsibleWrapper
							title=""
							side="right"
							icon="chartBar"
							chartCount={charts.length}
						>
							<ChartsViewer
								charts={charts}
								data={itemsData}
								onChartSelect={handleChartSelect}
								onChartDelete={handleDeleteChart}
							/>
						</CollapsibleWrapper>
					</StickyCharts>
				</VisualizationContainer>
			</MapContainer>
		</WrapContent>
	);
};

export default VisualizationsComponent;
