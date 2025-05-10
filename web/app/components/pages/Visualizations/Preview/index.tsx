import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LineChart from "~/components/molecules/Chart/LineChart";
import { theme } from "~/styles/theme";

import { LoadingOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import { useFetcher } from "@remix-run/react";
import * as turf from "@turf/turf";
import { Button, Progress, Spin, message } from "antd";
import type { Feature, FeatureCollection, Point } from "geojson";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { useNavigate, useParams } from "react-router-dom";
import { ZONE_CONFIGS, type ZoneConfig } from "~/commons/area.const";
import { CONTENT_FIELD_TYPE } from "~/commons/core.const";
import Icon from "~/components/atoms/Icon";
import ChartsViewer from "~/components/molecules/Chart/ChartsViewer";
import { transformLineChartData } from "~/components/molecules/Chart/ChartsViewer/transformers";
import type { ChartsFormType } from "~/components/molecules/Chart/ChartsViewer/type";
import CollapsibleWrapper from "~/components/molecules/Common/CollapsibleView";
import WrapContent from "~/components/molecules/Common/WrapContent";
import { useOptimizedGeoData } from "~/hooks/useOptimizedGeoData";
import type { ContentItem } from "~/models/content";
import type { Item, ItemsResponse } from "~/models/items";
import type { ModelItem } from "~/models/models";
import type { ApiResponse } from "~/repositories/utils";
import CustomizedMap from "../CustomizedMap";
import { ControlBar } from "../CustomizedMap/ControlBar";
import {
	MapContainer,
	StickyCharts,
	VisualizationContainer,
} from "../Dashboard/Preview/styled";
import {
	MAP_LAYERS,
	type MapLayerKey,
	type Measurement,
	type PreviewItem,
} from "../types";

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

const PreRequestLoadingContainer = styled.div`
  margin-top: 70px;
  .rotate-path {
    margin: auto;
    text-align: center;
  }
  .rotate-path .ant-progress-circle-path {
    animation: rotate-path 2s linear infinite;
    transform-origin: center;
  }
  @keyframes rotate-path {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  .process {
    margin-bottom: 70px;
  }`;
const VisualzationPreviewComponent: React.FC = () => {
	const { ufnId, useCaseId } = useParams();
	const [storedModel, setStoredModel] = useState<ModelItem | null>(null);
	const [items, setItems] = useState<Item[]>([]);
	const [showDefinedData, setShowDefinedData] = useState<boolean>(false);
	const [loading, setLoading] = useState(false);
	const [selectedSchema, setSelectedSchema] = useState<
		ContentItem | undefined
	>();
	const navigator = useNavigate();
	const [charts, setCharts] = useState<ChartsFormType[]>([]);

	const fetch = useFetcher<ApiResponse<ItemsResponse>>();
	const fetchSchemaDetail = useFetcher<ApiResponse<ContentItem>>();

	const handleDefineDataset = useCallback(async () => {
		if (!ufnId) return;
		setShowDefinedData((prevState) => !prevState);
	}, [ufnId]);

	useEffect(() => {
		const storedCharts = localStorage.getItem("selectedCharts");
		if (storedCharts) {
			const parsedData = JSON.parse(storedCharts);
			setCharts(parsedData);
		}
	}, []);
	const [selectedLayer, setSelectedLayer] = useState<MapLayerKey>("reference");
	const [activeZones, setActiveZones] = useState<
		Set<keyof typeof ZONE_CONFIGS>
	>(new Set());
	const [activeZoneConfig, setActiveZoneConfig] = useState<ZoneConfig | null>(
		null,
	);
	const [selectedAccident, setSelectedAccident] = useState<
		AccidentFeature | undefined
	>(undefined);

	const handleMarkerClick = useCallback((feature: AccidentFeature) => {
		setSelectedAccident(feature);
	}, []);
	const { geoJsonData, geometries } = useOptimizedGeoData(activeZoneConfig);
	const [isMapLoaded, setIsMapLoaded] = useState(false);
	const [isLoadingGeoJson, setIsLoadingGeoJson] = useState(false);
	const mapRef = useRef<maplibregl.Map | null>(null);
	const maplibreglRef = useRef<{ getMapRef: () => maplibregl.Map | null }>(
		null,
	);

	const handleMapInit = useCallback((map: maplibregl.Map) => {
		mapRef.current = map;

		map.setMinZoom(4);
		map.setMaxZoom(18);

		if (map.getZoom() < 4) {
			map.setZoom(4);
		}

		// Single event listener for style load
		const onStyleLoad = () => {
			setIsMapLoaded(true);
			map.off("style.load", onStyleLoad);
		};
		map.on("style.load", onStyleLoad);
	}, []);
	useEffect(() => {
		if (!mapRef.current || !isMapLoaded) return;

		mapRef.current.setStyle({
			version: 8,
			glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
			sources: {
				"raster-tiles": {
					type: "raster",
					tiles: [MAP_LAYERS[selectedLayer].url.replace("{s}", "a")],
					tileSize: 256,
					minzoom: 4,
					maxzoom: 18,
				},
			},
			layers: [
				{
					id: "simple-tiles",
					type: "raster",
					source: "raster-tiles",
					minzoom: 4,
					maxzoom: 18,
				},
			],
		});
	}, [selectedLayer, isMapLoaded]);
	useEffect(() => {
		if (!mapRef.current || !isMapLoaded) return;

		const map = mapRef.current;

		// Wait for style to be fully loaded
		if (!map.isStyleLoaded()) {
			// Add event listener for style.load
			const handleStyleLoad = () => {
				updateMapLayers();
				map.off("style.load", handleStyleLoad);
			};
			map.on("style.load", handleStyleLoad);
			return;
		}

		function updateMapLayers() {
			try {
				setIsLoadingGeoJson(true);

				if (!geoJsonData) {
					setIsLoadingGeoJson(false);
					return;
				}

				// Remove existing layers and sources safely
				if (map.getSource("zones")) {
					if (map.getLayer("zones-fill")) map.removeLayer("zones-fill");
					if (map.getLayer("zones-outline")) map.removeLayer("zones-outline");
					map.removeSource("zones");
				}

				// Optimize the GeoJSON data
				const data = Array.isArray(geoJsonData) ? geoJsonData[0] : geoJsonData;
				const simplifiedData = turf.simplify(data, {
					tolerance: 0.001,
					highQuality: false,
				});

				// Add the source and layers
				map.addSource("zones", {
					type: "geojson",
					data: simplifiedData,
					maxzoom: 18,
					tolerance: 0.375,
					buffer: 128,
				});

				map.addLayer({
					id: "zones-fill",
					type: "fill",
					source: "zones",
					paint: {
						"fill-color": activeZoneConfig?.style.color || "#FF0000",
						"fill-opacity": activeZoneConfig?.style.fillOpacity || 0.2,
					},
				});

				map.addLayer({
					id: "zones-outline",
					type: "line",
					source: "zones",
					paint: {
						"line-color": activeZoneConfig?.style.color || "#FF0000",
						"line-width": 2,
						"line-opacity": 0.8,
					},
				});
			} catch (error) {
				console.error("Error loading GeoJSON:", error);
			} finally {
				setIsLoadingGeoJson(false);
			}
		}

		updateMapLayers();
	}, [geoJsonData, activeZoneConfig, isMapLoaded]);

	// Add markers when they change
	useEffect(() => {
		if (!mapRef.current || !isMapLoaded || !geometries) return;

		const map = mapRef.current;

		// Remove existing source and layer if they exist
		if (map.getSource("accidents")) {
			map.removeLayer("accident-points");
			map.removeSource("accidents");
		}

		// Add custom marker image if not already added
		if (!map.hasImage("custom-marker")) {
			const markerSvg = `
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8z" fill="#00474F"/>
				</svg>
			`;

			const img = new Image();
			img.onload = () => {
				if (map.hasImage("custom-marker")) return;

				const canvas = document.createElement("canvas");
				const ctx = canvas.getContext("2d");
				if (!ctx) return;

				canvas.width = 24;
				canvas.height = 24;
				ctx.drawImage(img, 0, 0);

				map.addImage(
					"custom-marker",
					{
						width: 24,
						height: 24,
						data: new Uint8Array(ctx.getImageData(0, 0, 24, 24).data.buffer),
					},
					{ pixelRatio: 2 },
				); // Added pixelRatio for better resolution

				// Add source and layer after image is loaded
				addSourceAndLayer();
			};

			img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markerSvg)}`;
		} else {
			// If image already exists, add source and layer directly
			addSourceAndLayer();
		}

		function addSourceAndLayer() {
			// Add the source
			if (!geometries) return; // Early return if markers is null

			map.addSource("accidents", {
				type: "geojson",
				data: geometries as FeatureCollection,
			});

			// Add the marker layer
			map.addLayer({
				id: "accident-points",
				type: "symbol",

				source: "accidents",
				layout: {
					"icon-image": "custom-marker",
					"icon-size": 3.4,
					"icon-anchor": "bottom",
					"icon-allow-overlap": true,
					"text-field": ["get", "番号"], // Using the Japanese property name
					"text-size": 12,
					"text-anchor": "center",
					"text-offset": [0, -2.3],
					"text-allow-overlap": true,
				},
				paint: {
					"text-color": "#ffffff",
				},
			});

			// Add click handler for markers
			map.on("click", "accident-points", (e) => {
				if (e.features?.[0]) {
					handleMarkerClick(e.features[0] as unknown as AccidentFeature);
				}
			});

			// Change cursor to pointer when hovering over markers
			map.on("mouseenter", "accident-points", () => {
				map.getCanvas().style.cursor = "pointer";
			});

			map.on("mouseleave", "accident-points", () => {
				map.getCanvas().style.cursor = "";
			});
		}

		// Cleanup function
		return () => {
			if (map.getLayer("accident-points")) {
				map.removeLayer("accident-points");
			}
			if (map.getSource("accidents")) {
				map.removeSource("accidents");
			}
		};
	}, [geometries, isMapLoaded, handleMarkerClick]);

	// Fix handleZoneToggle to handle all zones properly
	const handleZoneToggle = useCallback(
		(zoneKey: keyof typeof ZONE_CONFIGS, enabled: boolean) => {
			try {
				setActiveZones((prev) => {
					const newZones = new Set(prev);
					if (enabled) {
						newZones.add(zoneKey);
					} else {
						newZones.delete(zoneKey);
					}
					return newZones;
				});

				// Update zone config
				const newConfig = enabled ? ZONE_CONFIGS[zoneKey] : null;
				if (newConfig) {
					// Ensure the style is loaded before updating
					if (mapRef.current?.isStyleLoaded()) {
						setActiveZoneConfig(newConfig);
					} else {
						mapRef.current?.once("style.load", () => {
							setActiveZoneConfig(newConfig);
						});
					}
				} else {
					setActiveZoneConfig(null);
				}
			} catch (error) {
				console.error("Error in handleZoneToggle:", error);
			}
		},
		[],
	);

	// Clean up cleanup effect
	useEffect(() => {
		return () => {
			const map = mapRef.current;
			if (!map?.style) return;

			try {
				// Remove event listeners
				const events = [
					"style.load",
					"error",
					"click",
					"mouseenter",
					"mouseleave",
				];
				for (const event of events) {
					const listeners = map._listeners[event];
					if (listeners) {
						for (const listener of listeners) {
							map.off(event, listener);
						}
					}
				}

				// Remove layers
				const style = map.getStyle();
				if (style?.layers) {
					const layerIds = style.layers.map((layer) => layer.id);
					for (const id of layerIds) {
						if (map.getLayer(id)) {
							map.removeLayer(id);
						}
					}
				}

				// Remove sources
				if (style?.sources) {
					for (const id of Object.keys(style.sources)) {
						if (map.getSource(id)) {
							map.removeSource(id);
						}
					}
				}

				map.remove();
				mapRef.current = null;
			} catch (error) {
				console.error("Error during map cleanup:", error);
			}
		};
	}, []);
	const actionButtons = (
		<>
			<Button
				onClick={async () => await handlePrint()}
				disabled={!ufnId || loading}
				className="min-w-[120px]"
			>
				{loading ? <Spin indicator={<LoadingOutlined spin />} /> : "PDF 出力"}
			</Button>
			<Button disabled={!ufnId || loading} onClick={() => downloadCSV()}>
				CSV 出力
			</Button>
			<Button disabled={!ufnId || loading} onClick={() => handleFullScreen()}>
				全画面表示
			</Button>
			<Button
				disabled={!ufnId || loading}
				onClick={() =>
					navigator(`/visualizations/${useCaseId}/dashboard/${ufnId}`)
				}
			>
				プレビューを終了
			</Button>
		</>
	);
	//# Commented out based on the following requirements:
	//# https://www.notion.so/eukarya/EBPM-1ba16e0fb16580279b7be6f5452c4ce5
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
	// 		const storedDataSet = localStorage.getItem("userSelectedModels");
	//
	// 		if (!storedDataSet) {
	// 			redirectToDataSetSelection();
	// 			return;
	// 		}
	//
	// 		const parsedData = JSON.parse(storedDataSet);
	// 		if (Array.isArray(parsedData) && parsedData.length > 0) {
	// 			setStoredModel(parsedData[0]);
	// 		} else {
	// 			redirectToDataSetSelection();
	// 			return;
	// 		}
	// 	} catch {
	// 		redirectToDataSetSelection();
	// 	}
	// }, [navigator]);
	const handleFullScreen = () => {
		document.getElementById("map-area")?.requestFullscreen();
	};
	useEffect(() => {
		if (storedModel) {
			setLoading(true);
			fetch.load(
				`/items?modelId=${storedModel?.id}&page=1&useCase=14&ufn=1&perPage=1000`,
			);
			fetchSchemaDetail.load(`/contents/${storedModel?.id}`);
		}
	}, [fetch.load, storedModel, fetchSchemaDetail.load]);

	useEffect(() => {
		if (fetch?.data?.status && fetchSchemaDetail?.data?.status) {
			const items = fetch?.data?.data;
			setItems(items.items);
			setSelectedSchema(fetchSchemaDetail?.data.data);
			setLoading(false);
		}
	}, [fetch.data, fetchSchemaDetail.data]);

	const downloadUFN002CSV = (storedData: string) => {
		if (!storedData) return;

		const { data, measurements } = JSON.parse(storedData);

		const headerLabels: Record<
			"month" | "windSpeed" | "waveHeight" | "visibility",
			string
		> = {
			month: "月",
			windSpeed: "風速",
			waveHeight: "波高",
			visibility: "視界",
		};

		const headers = ["month", ...measurements].map(
			(h) => headerLabels[h as keyof typeof headerLabels] || h,
		);
		const rows = data.map((item: PreviewItem) => {
			const monthValue = item.month;
			const fieldValues = item.fields.reduce<Record<string, string | number>>(
				(acc, field) => {
					acc[field.key] = field.value;
					return acc;
				},
				{},
			);

			return [
				monthValue,
				...measurements.map(
					(measurement: Measurement) => fieldValues[measurement] || "",
				),
			];
		});

		const BOM = "\uFEFF";
		const csvContent =
			BOM +
			[headers, ...rows]
				.map((line) => line.map((field: string) => `"${field}"`).join(","))
				.join("\n");

		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = `気象データ_${new Date().toISOString().split("T")[0]}.csv`;
		link.click();
	};

	const columns = useMemo(() => {
		return (
			storedModel?.schema.fields
				.filter((field) => field.type !== CONTENT_FIELD_TYPE.GEO)
				.map((field) => ({
					title: field.key.charAt(0).toUpperCase() + field.key.slice(1),
					dataIndex: field.key,
					key: field.id,
				})) || []
		);
	}, [storedModel]);
	const dataSource = useMemo(() => {
		return items.map((item: Item) => {
			const row: { key: string; [key: string]: React.Key } = { key: item.id };
			for (const field of item.fields) {
				row[field.key] = field.value;
			}
			return row;
		});
	}, [items]);

	const mapContainerRef = useRef<HTMLDivElement>(null);
	const downloadCSV = async () => {
		// Create a new zip instance
		const zip = new JSZip();

		// Handle UFN002 special case first
		if (useCaseId === "14" && ufnId === "2") {
			const storedData = localStorage.getItem("UFN002_chart");
			if (storedData) {
				const csvContent = await generateUFN002CSV(storedData);
				zip.file("気象データ.csv", csvContent);
			}
		} else {
			// Generate regular CSV
			const headers = columns.map((col) => col.title);
			const rows = dataSource.map((row) =>
				columns.map((col) => row[col.dataIndex] ?? ""),
			);
			const csvContent = [headers, ...rows]
				.map((line) => line.map((field) => `"${field}"`).join(","))
				.join("\n");
			const BOM = "\uFEFF";
			zip.file("data.csv", BOM + csvContent);
		}

		// Add GeoJSON files if they exist
		if (geoJsonData) {
			zip.file("zones.geojson", JSON.stringify(geoJsonData, null, 2));
		}

		if (geometries) {
			zip.file("points.geojson", JSON.stringify(geometries, null, 2));
		}

		// Generate the zip file
		const zipBlob = await zip.generateAsync({ type: "blob" });

		// Create download link and trigger download
		const link = document.createElement("a");
		link.href = URL.createObjectURL(zipBlob);
		link.download = `data_export_${Date.now()}.zip`;
		link.click();
		URL.revokeObjectURL(link.href);
	};

	// Add this helper function for UFN002 CSV generation
	const generateUFN002CSV = async (storedData: string) => {
		const { data, measurements } = JSON.parse(storedData);

		const headerLabels: Record<
			"month" | "windSpeed" | "waveHeight" | "visibility",
			string
		> = {
			month: "月",
			windSpeed: "風速",
			waveHeight: "波高",
			visibility: "視界",
		};

		const headers = ["month", ...measurements].map(
			(h) => headerLabels[h as keyof typeof headerLabels] || h,
		);

		const rows = data.map((item: PreviewItem) => {
			const monthValue = item.month;
			const fieldValues = item.fields.reduce<Record<string, string | number>>(
				(acc, field) => {
					acc[field.key] = field.value;
					return acc;
				},
				{},
			);

			return [
				monthValue,
				...measurements.map(
					(measurement: Measurement) => fieldValues[measurement] || "",
				),
			];
		});

		const BOM = "\uFEFF";
		return (
			BOM +
			[headers, ...rows]
				.map((line) => line.map((field: string) => `"${field}"`).join(","))
				.join("\n")
		);
	};

	const handlePrint = useCallback(async () => {
		const mapInstance = maplibreglRef.current?.getMapRef();
		if (mapInstance) {
			mapInstance.resize();
			await mapInstance.once("idle");

			const element = document.getElementById("map-area");
			if (!element) return;
			const mapCanvas = await html2canvas(element, {
				useCORS: true,
				allowTaint: true,
			});
			// const mapCanvas = mapInstance.getCanvas();
			const image = mapCanvas.toDataURL("image/png");
			const width = mapCanvas.width;
			const height = mapCanvas.height;
			if (image) {
				const pdf = new jsPDF({
					orientation: "landscape",
					unit: "px",
					format: [width, height],
				});
				pdf.addImage(image, "PNG", 0, 0, width, height);
				pdf.save("map.pdf");
			}
		}
	}, []);

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

	return loading ? (
		<PreRequestLoadingContainer>
			<div className="rotate-path">
				<Progress
					type="circle"
					percent={75}
					format={() => null}
					className="process"
				/>
			</div>
		</PreRequestLoadingContainer>
	) : (
		<WrapContent
			breadcrumbItems={[
				{
					href: "/visualizations",
					title: (
						<>
							<Icon icon="chartBar" size={24} color={theme.colors.semiBlack} />
							<span>EBPM Tools</span>
						</>
					),
				},
			]}
			actions={actionButtons}
		>
			<MapContainer id="map-area">
				<VisualizationContainer>
					<div
						style={{
							position: "absolute",
							right: "0px",
							top: "0px",
							zIndex: 1,
						}}
					>
						<ControlBar
							selectedLayer={selectedLayer}
							onLayerChange={setSelectedLayer}
							onZoneToggle={handleZoneToggle}
							activeZones={activeZones}
							mapRef={mapRef.current || null}
						/>
					</div>
					<div style={{ position: "absolute", width: "100%", height: "100%" }}>
						<CustomizedMap
							selectedLayer={selectedLayer}
							onLayerChange={setSelectedLayer}
							activeZoneConfig={activeZoneConfig}
							setActiveZoneConfig={setActiveZoneConfig}
							onAccidentSelect={setSelectedAccident}
							markers={
								(geometries as FeatureCollection<Point> | null) || undefined
							}
							geoJsonData={geoJsonData || undefined}
							ref={maplibreglRef}
						/>
					</div>
					<StickyCharts>
						<CollapsibleWrapper
							title=""
							side="right"
							icon="chartBar"
							chartCount={charts.length}
						>
							{useCaseId === "14" && ufnId === "2" ? (
								(() => {
									const storedData = localStorage.getItem("UFN002_chart");
									if (storedData) {
										const { data, measurements } = JSON.parse(storedData);

										const { transformedData, mappings } =
											transformLineChartData(
												data as unknown as Record<string, unknown>[],
												measurements,
											);

										return (
											<LineChart
												data={transformedData}
												xAxis="month"
												yAxes={measurements}
												isDot={false}
											/>
										);
									}
									return null;
								})()
							) : (
								<ChartsViewer
									charts={charts}
									data={items}
									onChartSelect={() => {}}
									onChartDelete={() => {}}
								/>
							)}
						</CollapsibleWrapper>
					</StickyCharts>
				</VisualizationContainer>
			</MapContainer>
		</WrapContent>
	);
};

export default VisualzationPreviewComponent;
