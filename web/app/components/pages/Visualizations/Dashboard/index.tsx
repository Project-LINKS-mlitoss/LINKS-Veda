import { LoadingOutlined } from "@ant-design/icons";
import { Navigate, useFetcher, useNavigate, useParams } from "@remix-run/react";
import * as turf from "@turf/turf";
import { Tabs, message } from "antd";
import type {
	Feature,
	FeatureCollection,
	GeoJsonProperties,
	Geometry,
	Point,
} from "geojson";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ZoneConfig } from "~/commons/area.const";
import { CONTENT_FIELD_TYPE } from "~/commons/core.const";
import Button from "~/components/atoms/Button";
import Icon from "~/components/atoms/Icon";
import Table from "~/components/atoms/Table";
import type { ChartType } from "~/components/molecules/Chart/types";
import WrapContent from "~/components/molecules/Common/WrapContent";
import Sidebar from "~/components/molecules/Sidebar";
import { useOptimizedGeoData } from "~/hooks/useOptimizedGeoData";
import type { ContentItem } from "~/models/content";
import type { Item, ItemField, ItemsResponse } from "~/models/items";
import type { ApiResponse } from "~/repositories/utils";
import { routes } from "~/routes/routes";
import { theme } from "~/styles/theme";
import CustomizedMap from "../CustomizedMap";
import type { GeoJSONLayer, MapLayerKey } from "../types";
import { MapContainer, VisualizationContainer } from "./Preview/styled";
import {
	ModelSelectionContainer,
	ModelSelectionRow,
	SettingSection,
} from "./styled";

const generateChartId = (title: string, type: ChartType): string => {
	return `chart-${type}-${title}-${Date.now()}`;
};

const ufnOptions = [
	{
		id: 16,
		data: [
			{
				id: 1,
				name: "UFN001",
				title: "飛行計画データから地域の利用特性把握のための可視化・集計機能",
			},
			{
				id: 2,
				name: "UFN002",
				title: "事故報告書の情報を条件検索・可視化する機能",
			},
		],
	},
	{
		id: 17,
		data: [
			{
				id: 1,
				name: "UFN001",
				title: "一般旅客定期航路事業を可視化する機能",
			},
		],
	},
	{
		id: 15,
		data: [
			{
				id: 1,
				name: "UFN001",
				title: "一般旅客定期航路事業を可視化する機能",
			},
		],
	},
	{
		id: 14,
		data: [
			{
				id: 1,
				name: "UFN001",
				title: "一般旅客定期航路事業を可視化する機能",
			},
			{
				id: 2,
				name: "UFN002",
				title: "事故情報を検索・抽出する機能​",
			},
		],
	},
	{
		id: 13,
		data: [
			{
				id: 1,
				name: "UFN001",
				title: "都道府県間貨物流動量の可視化・実態分析機能",
			},
			{
				id: 2,
				name: "UFN002",
				title: "モーダルシフト検討のためのマルチモーダル経路探索機能",
			},
		],
	},
];

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

const Dashboard = () => {
	const navigator = useNavigate();
	const { useCaseId } = useParams();

	const fetch = useFetcher<ApiResponse<ItemsResponse>>();

	const [storedModel, setStoredModel] = useState<ContentItem | null>(null);
	const [selectedModelItems, setSelectedModelItems] = useState<Item[]>([]);
	const [selectedModels, setSelectedModels] = useState<ContentItem[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [selectedDashboard, setSelectedDashboard] = useState<number | null>(
		null,
	);
	const [showDefinedData, setShowDefinedData] = useState<boolean>(false);

	// MAP CONTROLS START //
	const [selectedLayer, setSelectedLayer] = useState<MapLayerKey>("reference");

	const [activeZoneConfig, setActiveZoneConfig] = useState<ZoneConfig | null>(
		null,
	);

	// TODO: That is for Minh-san's task. This selectedAccident object can be used to show the accident details
	const [selectedAccident, setSelectedAccident] = useState<
		AccidentFeature | undefined
	>(undefined);
	const [markers, setMarkers] = useState<FeatureCollection | null>(null);
	const { geoJsonData } = useOptimizedGeoData(activeZoneConfig ?? null);

	// useEffect(() => {
	// 	setLoading(true);
	// 	// if (storedModel) {
	// 	// 	fetch.load(`/items?modelId=${storedModel?.id}&page=1perPage=1000`);
	// 	// }
	// }, [fetch.load, storedModel]);
	useEffect(() => {
		if (fetch?.data?.status) {
			const items = fetch?.data?.data;
			setSelectedModelItems(items.items);
			if (!storedModel) return;
			const newFeatures: GeoJSON.Feature<
				GeoJSON.Geometry,
				GeoJSON.GeoJsonProperties
			>[] = [];
			for (const item of items.items || []) {
				const properties: GeoJSON.GeoJsonProperties = {};
				let geometry: GeoJSON.Geometry;

				for (const field of storedModel.schema.fields || []) {
					const fieldData = item?.fields?.find(
						(f: ItemField) => f?.id === field?.id,
					);

					if (fieldData) {
						if (fieldData?.type === CONTENT_FIELD_TYPE.GEO) {
							geometry = JSON.parse(fieldData?.value) as GeoJSON.Geometry;
							if (geometry !== null) {
							}

							newFeatures.push({
								type: "Feature",
								properties,
								geometry: geometry,
							});
						} else {
							properties[field?.key] = fieldData?.value;
						}
					}
				}
			}
			const filteredMarkers = turf.featureCollection(
				newFeatures.filter((f: Feature<Geometry, GeoJsonProperties>) => {
					if (!f.geometry) return false;
					switch (f.geometry.type) {
						case "Point":
						case "MultiPoint":
						case "LineString":
						case "MultiLineString":
						case "Polygon":
						case "MultiPolygon":
							return true;
						default:
							return false;
					}
				}),
			);
			setMarkers(filteredMarkers);
			setLoading(false);
		}
	}, [fetch.data, storedModel]);

	//# Commented out based on the following requirements:
	//# [Insert requirement details or link here]
	// useEffect(() => {
	// 	let hasRedirected = false;
	//
	// 	const redirectToDataSetSelection = () => {
	// 		message.config({
	// 			top: 0,
	// 			duration: 3,
	// 			maxCount: 1,
	// 		});
	//
	// 		if (!hasRedirected) {
	// 			message.warning({
	// 				content: "データセットを選択",
	// 				style: {
	// 					position: "fixed",
	// 					top: 20,
	// 					right: 20,
	// 					transform: "none", // Prevents default centering
	// 					margin: 0,
	// 				},
	// 			});
	// 			navigator("/visualizations/datasets");
	// 			hasRedirected = true;
	// 		}
	// 	};
	//
	// 	try {
	// 		const storedDataSet = localStorage.getItem("currentSelectedModel");
	// 		const selectedModels = localStorage.getItem("userSelectedModels");
	// 		if (!storedDataSet || !selectedModels) {
	// 			redirectToDataSetSelection();
	// 			return;
	// 		}
	//
	// 		const parsedData = JSON.parse(storedDataSet);
	// 		const parsedSelectedModels = JSON.parse(selectedModels);
	// 		if (
	// 			parsedData &&
	// 			Array.isArray(parsedSelectedModels) &&
	// 			parsedSelectedModels.length > 0
	// 		) {
	// 			setStoredModel(parsedData);
	// 			setSelectedModels(parsedSelectedModels);
	// 		} else {
	// 			redirectToDataSetSelection();
	// 			return;
	// 		}
	// 	} catch {
	// 		redirectToDataSetSelection();
	// 	}
	// }, [navigator]);

	const columns = useMemo(() => {
		return (
			storedModel?.schema.fields.map((field) => ({
				title: field.key.charAt(0).toUpperCase() + field.key.slice(1),
				dataIndex: field.key,
				key: field.id,
			})) || []
		);
	}, [storedModel]);

	const dataSource = useMemo(() => {
		return selectedModelItems.map((item: Item) => {
			const row: { key: string; [key: string]: React.Key } = { key: item.id };
			for (const field of item.fields) {
				row[field.key] = field.value;
			}
			return row;
		});
	}, [selectedModelItems]);

	const handleDefineDataset = useCallback(async () => {
		if (!useCaseId) return;
		setShowDefinedData((prevState) => !prevState);
	}, [useCaseId]);

	const setActiveModel = (id: string) => {
		const currentModel = selectedModels.filter((model) => model.id === id);
		if (currentModel.length > 0) {
			setStoredModel(currentModel[0]);
			localStorage.setItem(
				"currentSelectedModel",
				JSON.stringify(currentModel[0]),
			);
		}
	};
	useEffect(() => {
		if (fetch?.data?.status) {
			const modelsItemsResponse = fetch?.data?.data;
			setSelectedModelItems(modelsItemsResponse?.items || []);
			setLoading(false);
		}
	}, [fetch.data]);

	const actionButtons = (
		<>
			<Button onClick={handleDefineDataset} className="min-w-[120px]">
				Defined Data
			</Button>
		</>
	);

	const handleRedirectToVisualize = useCallback(() => {
		navigator(routes.visualization);
	}, [navigator]);

	const handleRedirectToDataSetSelection = useCallback(() => {
		navigator(`/visualizations/${useCaseId}`);
	}, [navigator, useCaseId]);

	const handleRedirectToUFNDashboard = useCallback(
		(ufnId: string) => {
			navigator(`/visualizations/${useCaseId}/dashboard/${ufnId}`);
		},
		[navigator, useCaseId],
	);

	if (useCaseId === "16") {
		handleRedirectToUFNDashboard("2");
		return;
	}

	const sideBarTitle = useMemo(() => {
		if (useCaseId === "16") {
			return `UC${useCaseId} 一人航空機の事故情報データ`;
		}
		if (useCaseId === "14") {
			return `UC${useCaseId} 一般旅客定期航路事業許可申請情報等の活用`;
		}
		if (useCaseId === "15") {
			return `UC${useCaseId}`;
		}
		return `UC${useCaseId} 無人航空機の事故情報データ`;
	}, [useCaseId]);

	const allLayers = useMemo(() => {
		if (!markers) return [];

		return [
			{
				id: "zones",
				data: markers,
				type: "polygon",
				style: {
					color: "#4CAF50",
					fillOpacity: 0.2,
					weight: 1,
					opacity: 0.8,
				},
			},
		];
	}, [markers]);

	if (
		useCaseId === "13" ||
		useCaseId === "14" ||
		useCaseId === "15" ||
		useCaseId === "19" ||
		useCaseId === "20"
	) {
		handleRedirectToUFNDashboard("1");
		return null;
	}

	if (useCaseId === "12") {
		handleRedirectToUFNDashboard("1");
	}
	if (useCaseId === "17") {
		handleRedirectToUFNDashboard("1");
	}

	return (
		<WrapContent
			breadcrumbItems={[
				{
					href: `/visualizations/${useCaseId}`,
					title: (
						<>
							<Icon icon="swap" size={24} color={theme.colors.semiBlack} />
							<span>{`EBPM Tools / UC${useCaseId} / ${storedModel?.name || ""}`}</span>
						</>
					),
				},
			]}
			actions={actionButtons}
		>
			<MapContainer>
				<VisualizationContainer>
					{!showDefinedData && (
						<>
							<CustomizedMap
								selectedLayer={selectedLayer}
								onLayerChange={setSelectedLayer}
								activeZoneConfig={activeZoneConfig}
								setActiveZoneConfig={setActiveZoneConfig}
								onAccidentSelect={setSelectedAccident}
								layers={allLayers as GeoJSONLayer[]}
								geoJsonData={geoJsonData || undefined}
							/>
							<Sidebar
								title={sideBarTitle}
								initialWidth={340}
								onBackClick={() => handleRedirectToVisualize()}
							>
								<ModelSelectionContainer>
									<h4>UFNを選択</h4>
									{ufnOptions
										.find((option) => option.id.toString() === useCaseId)
										?.data.map((option) => (
											<ModelSelectionRow
												key={option.id}
												isSelected={selectedDashboard === option.id}
												onClick={() => setSelectedDashboard(option.id)}
												onDoubleClick={() =>
													handleRedirectToUFNDashboard(option.id.toString())
												}
											>
												<div className="ufn-id">{option.name}</div>
												<div className="ufn-content">{option.title}</div>
											</ModelSelectionRow>
										))}
									<SettingSection>
										<h4>設定</h4>
										<button
											type="button"
											onClick={handleRedirectToDataSetSelection}
										>
											データセットを選択する
										</button>
									</SettingSection>
								</ModelSelectionContainer>
							</Sidebar>
						</>
					)}
					{showDefinedData && (
						<div className="m-3 h-[84vh] bg-white flex-1 padding-[16px] overflow-auto">
							<div className="ml-4">
								{" "}
								{/* Tailwind class for margin-left */}
								<Tabs
									defaultActiveKey={storedModel?.id || selectedModels[0]?.id}
									onChange={(key) => setActiveModel(key)}
									items={selectedModels.map((model, index) => {
										return {
											label: model.name,
											key: model.id,
										};
									})}
								/>
							</div>

							<Table
								columns={columns}
								dataSource={dataSource}
								pagination={false}
								rowKey="key"
							/>
						</div>
					)}
				</VisualizationContainer>
			</MapContainer>
		</WrapContent>
	);
};

export default Dashboard;
