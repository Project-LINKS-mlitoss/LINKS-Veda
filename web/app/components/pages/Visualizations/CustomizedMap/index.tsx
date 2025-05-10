import type {
	Feature,
	FeatureCollection,
	GeoJsonProperties,
	Geometry,
} from "geojson";
import maplibregl, { type FilterSpecification } from "maplibre-gl";
import {
	forwardRef,
	memo,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import { TOKYO_COORDINATES, ZONE_CONFIGS } from "~/commons/area.const";
import { MapContainer } from "../styles";
import type {
	AccidentFeature,
	GeoJSONFeature,
	GeoJSONLayer,
	MapProps,
} from "../types";
import { MAP_LAYERS } from "../types";
import { ControlBar } from "./ControlBar";

interface MapState {
	center: maplibregl.LngLat;
	zoom: number;
	bearing: number;
	pitch: number;
}
interface MapLayer extends Omit<GeoJSONLayer, "data" | "type"> {
	data?: GeoJSONLayer["data"];
	type: GeoJSONLayer["type"] | "line" | "fill"; // Add vector tile layer types
	markerType?: "default" | "circle";
	sourceType?: "vector";
	tiles?: string[];
	sourceLayer?: string;
	minzoom?: number;
	maxzoom?: number;
	promoteId?: string;
	filter?: unknown;
}

const arePropsEqual = <T extends GeoJSONFeature>(
	prevProps: MapProps<T>,
	nextProps: MapProps<T>,
) => {
	return (
		prevProps.selectedLayer === nextProps.selectedLayer &&
		prevProps.activeZoneConfig === nextProps.activeZoneConfig &&
		prevProps.activeZoneConfigArray === nextProps.activeZoneConfigArray &&
		prevProps.keyField === nextProps.keyField &&
		JSON.stringify(prevProps.markers) === JSON.stringify(nextProps.markers) &&
		JSON.stringify(prevProps.geoJsonData) ===
			JSON.stringify(nextProps.geoJsonData) &&
		JSON.stringify(prevProps.layers) === JSON.stringify(nextProps.layers)
	);
};

const CustomizedMapBase = forwardRef(function CustomizedMap<
	T extends GeoJSONFeature = AccidentFeature,
>(
	{
		selectedLayer,
		onLayerChange,
		activeZoneConfig,
		setActiveZoneConfig,
		activeZoneConfigArray,
		setActiveZoneConfigArray,
		onAccidentSelect,
		markers,
		geoJsonData,
		onMapInit,
		keyField = "報告書番号（事故等番号）",
		layers = [],
		setMapInstance,
	}: MapProps<T> & { layers?: MapLayer[] },
	ref: React.Ref<maplibregl.Map | null>,
) {
	const mapContainer = useRef<HTMLDivElement>(null);
	const mapRef = useRef<maplibregl.Map | null>(null);
	const [activeZones, setActiveZones] = useState<
		Set<keyof typeof ZONE_CONFIGS>
	>(new Set());
	const [isMapLoaded, setIsMapLoaded] = useState(false);
	const [isStyleLoaded, setIsStyleLoaded] = useState(false);
	const [layerVisibility, setLayerVisibility] = useState<
		Record<string, boolean>
	>({});

	const preserveMapState = useCallback(
		(map: maplibregl.Map | null): MapState | null => {
			if (!map) return null;
			return {
				center: map.getCenter(),
				zoom: map.getZoom(),
				bearing: map.getBearing(),
				pitch: map.getPitch(),
			};
		},
		[],
	);

	useImperativeHandle(ref, () => mapRef.current);

	const restoreMapState = useCallback(
		(map: maplibregl.Map | null, state: MapState | null) => {
			if (!map || !state) return;
			map.setCenter(state.center);
			map.setZoom(state.zoom);
			map.setBearing(state.bearing);
			map.setPitch(state.pitch);
		},
		[],
	);
	// Move handleMarkerClick definition before the effects
	const handleMarkerClick = useCallback(
		(feature: T) => {
			onAccidentSelect?.(feature);
		},
		[onAccidentSelect],
	);

	useEffect(() => {
		if (activeZoneConfigArray && activeZoneConfigArray.length > 0) {
			const newZones = new Set(activeZoneConfigArray);
			setActiveZones(newZones);
			const lastZone = activeZoneConfigArray[activeZoneConfigArray.length - 1];
			setActiveZoneConfig(ZONE_CONFIGS[lastZone]);
		} else {
			setActiveZones(new Set());
			setActiveZoneConfig(null);
		}
	}, [activeZoneConfigArray, setActiveZoneConfig]);

	const handleZoneToggle = useCallback(
		(zone: keyof typeof ZONE_CONFIGS, enabled: boolean) => {
			setActiveZones((prev) => {
				const newZones = new Set(prev);
				if (enabled) {
					newZones.add(zone);
					setActiveZoneConfig(ZONE_CONFIGS[zone]);
					if (setActiveZoneConfigArray) {
						setActiveZoneConfigArray((prev) => {
							return [...prev, zone];
						});
					}
				} else {
					newZones.delete(zone);
					setActiveZoneConfig(null);
					if (setActiveZoneConfigArray) {
						setActiveZoneConfigArray((prev) => {
							return prev.filter((item) => item !== zone);
						});
					}
				}

				return newZones;
			});
		},
		[setActiveZoneConfigArray, setActiveZoneConfig],
	);

	const memoizedOnMapInit = useCallback(
		(map: maplibregl.Map) => {
			if (onMapInit) {
				onMapInit(map);
			}
		},
		[onMapInit],
	);

	const memoizedTiles = useMemo(() => {
		return [MAP_LAYERS[selectedLayer].url.replace("{s}", "a")];
	}, [selectedLayer]);

	const memoizedTileUrlsRef = useRef([...memoizedTiles]);

	useEffect(() => {
		if (!mapContainer.current) return;

		const map = new maplibregl.Map({
			container: mapContainer.current,
			style: {
				version: 8,
				glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
				sources: {
					"raster-tiles": {
						type: "raster",
						tiles: memoizedTileUrlsRef.current,
						tileSize: 256,
					},
				},
				layers: [
					{
						id: "simple-tiles",
						type: "raster",
						source: "raster-tiles",
						minzoom: 0,
						maxzoom: 22,
					},
				],
			},
			center: [TOKYO_COORDINATES[1], TOKYO_COORDINATES[0]],
			zoom: 4,
		});

		mapRef.current = map;

		const setupMap = () => {
			if (!map.isStyleLoaded()) {
				// Wait for style to load
				map.once("style.load", setupMap);
				return;
			}

			setIsMapLoaded(true);
			setIsStyleLoaded(true);
			initializeMarkerImages();
			memoizedOnMapInit(map);
		};

		map.on("load", setupMap);

		return () => {
			map.remove();
			mapRef.current = null;
		};
	}, [memoizedOnMapInit]);

	useEffect(() => {
		const map = mapRef.current;
		if (!map || !isStyleLoaded) return;

		try {
			// Preserve current map state
			const state = preserveMapState(map);

			// Update base layer source
			const source = map.getSource(
				"raster-tiles",
			) as maplibregl.RasterTileSource;
			if (source) {
				source.setTiles([MAP_LAYERS[selectedLayer].url.replace("{s}", "a")]);
			}

			// Restore map state
			restoreMapState(map, state);
		} catch (error) {
			console.error("Error updating base layer:", error);
		}
	}, [selectedLayer, isStyleLoaded, restoreMapState, preserveMapState]);

	// Initialize marker images
	const initializeMarkerImages = useCallback(() => {
		if (!mapRef.current) return;

		// Create circle marker SVG function
		const createCircleMarkerSvg = (color: string, size = 45) => `
			<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
				<circle 
					cx="50" 
					cy="50" 
					r="${size}" 
					fill="${color}" 
					fill-opacity="0.85"
					stroke="#ffffff" 
					stroke-width="2"
					stroke-opacity="0.9"
				/>
				<circle 
					cx="50" 
					cy="50" 
					r="${size - 2}" 
					fill="none"
					stroke="${color}" 
					stroke-width="1.5"
					stroke-opacity="1"
				/>
			</svg>
		`;
		const flightPlanClusterRanges = [
			{ min: 0, max: 99, color: "#FF6B6B", size: 35 }, // Light Red
			{ min: 100, max: 499, color: "#D32F2F", size: 40 }, // Medium Red
			{ min: 500, max: 999, color: "#B71C1C", size: 45 }, // Dark Red
			{ min: 1000, max: Number.POSITIVE_INFINITY, color: "#8B0000", size: 50 }, // Deepest Red
		];
		for (const range of flightPlanClusterRanges) {
			const img = new Image();
			img.onload = () => {
				if (!mapRef.current) return;
				mapRef.current.addImage(`flight-cluster-${range.min}`, img);
			};
			img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
				createCircleMarkerSvg(range.color, range.size),
			)}`;
		}

		// Update the countRanges array with more distinct shades of #50AD0B
		const countRanges = [
			{ min: 0, max: 99, color: "#7ED321", size: 35 }, // Açık yeşil
			{ min: 100, max: 499, color: "#50AD0B", size: 40 }, // Normal yeşil
			{ min: 500, max: 999, color: "#2D7A06", size: 45 }, // Koyu yeşil
			{ min: 1000, max: Number.POSITIVE_INFINITY, color: "#1B4B04", size: 50 }, // En koyu yeşil
		];

		// Create images for each range
		for (const range of countRanges) {
			const img = new Image();
			img.onload = () => {
				if (!mapRef.current) return;
				mapRef.current.addImage(`circle-${range.min}`, img);
			};
			img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
				createCircleMarkerSvg(range.color, range.size),
			)}`;
		}

		const defaultMarkerSvg = `
			<svg width="21" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8z" fill="#00474F"/>
			</svg>
		`;
		const selectedMarkerSvg = `
			<svg width="21" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8z" fill="#00cc81"/>
			</svg>
		`;

		const flightPlanMarkerSvg = `
			<svg width="21" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8z" fill="#FF4B4B"/>
			</svg>
		`;
		const takeoffLandingMarkerSvg = `
			<svg width="21" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8z" fill="#FFB800"/>
			</svg>
		`;

		const img = new Image();
		img.onload = () => {
			if (!mapRef.current) return;
			mapRef.current.addImage("default-marker", img);
		};
		img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(defaultMarkerSvg)}`;
		const img_selected = new Image();
		img_selected.onload = () => {
			if (!mapRef.current) return;
			mapRef.current.addImage("selected-marker", img_selected);
		};
		img_selected.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(selectedMarkerSvg)}`;

		// Add flight plan marker
		const img_flight = new Image();
		img_flight.onload = () => {
			if (!mapRef.current) return;
			mapRef.current.addImage("flight-plans", img_flight);
		};
		img_flight.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(flightPlanMarkerSvg)}`;

		// Add takeoff/landing marker
		const img_takeoff = new Image();
		img_takeoff.onload = () => {
			if (!mapRef.current) return;
			mapRef.current.addImage("takeoff-landing-marker", img_takeoff);
		};
		img_takeoff.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(takeoffLandingMarkerSvg)}`;
	}, []);

	const handleLayerClickRef = useRef<{
		[k: string]: (e: maplibregl.MapMouseEvent) => void;
	}>({});

	// Update addLayer to properly handle line geometry
	// biome-ignore lint/correctness/useExhaustiveDependencies: ignore
	const addLayer: (layer: MapLayer) => void = useCallback(
		(layer: MapLayer) => {
			if (!mapRef.current || !isMapLoaded || !isStyleLoaded) return;
			const map = mapRef.current;
			if (setMapInstance) {
				setMapInstance(map);
			}
			const clearOtherSelections = () => {
				const zones = [
					"red-zones",
					"yellow-zones",
					"flight-plan-layer",
					"flight-plans",
					"surrounding-areas",
					"inhabited-areas",
					"landing-areas",
					"administrative-boundary",
				];

				for (const zoneId of zones) {
					if (map.getSource(zoneId)) {
						map.removeFeatureState({
							source: zoneId,
						});
					}
				}
			};

			try {
				// Remove existing layers and sources
				if (map.getLayer(layer.id)) {
					map.removeLayer(layer.id);
				}
				if (map.getLayer(`${layer.id}-selected-source`)) {
					map.removeLayer(`${layer.id}-selected-source`);
				}
				if (map.getSource(layer.id)) {
					const layersToRemove =
						map.getStyle().layers?.filter(
							// @ts-ignore
							(l) => l.source === layer.id,
						) || [];

					for (const layer of layersToRemove) {
						if (map.getLayer(layer.id)) {
							map.removeLayer(layer.id);
						}
					}

					map.removeSource(layer.id);
				}
				if (map.getSource(`${layer.id}-selected-source`)) {
					map.removeSource(`${layer.id}-selected-source`);
				}

				// Add new source and layer
				if ("sourceType" in layer && layer.sourceType === "vector") {
					try {
						// Vector tile handling
						if (!map.getSource(layer.id)) {
							map.addSource(layer.id, {
								type: "vector",
								tiles: layer.tiles,
								minzoom: layer.minzoom || 0,
								maxzoom: layer.maxzoom || 22,
								promoteId: layer.promoteId,
							});
						}

						map.on("sourcedata", function waitForSource(e) {
							if (
								map.getSource(layer.id) &&
								e.sourceId === layer.id &&
								map.isSourceLoaded(layer.id)
							) {
								if (!map.getLayer(layer.id)) {
									map.addLayer({
										id: layer.id,
										type: "line",
										source: layer.id,
										"source-layer": layer.sourceLayer,
										layout: {
											visibility: "visible",
											"line-join": "round",
											"line-cap": "round",
										},
										paint: {
											"line-color": [
												"case",
												["boolean", ["feature-state", "selected"], false],
												"#ffba08", // Selected color
												layer.style?.color || "#FF5733", // Default color
											],
											"line-width": layer.style?.weight || 2,
											"line-opacity": layer.style?.opacity || 1,
										},
										filter:
											(layer.filter as FilterSpecification) ||
											(["all"] as FilterSpecification),
									});
									if (layer.id.startsWith("flightPlans-")) {
										const firstLayer = map.getStyle().layers?.[2]?.id; // Get the bottommost layer
										if (firstLayer) {
											map.moveLayer(layer.id, firstLayer);
										}
									}
								}
								const features = map.querySourceFeatures(layer.id, {
									sourceLayer: layer.sourceLayer,
								});
								map.off("sourcedata", waitForSource);
							}
						});
						if (setLayerVisibility) {
							setLayerVisibility((prev) => ({
								...prev,
								[layer.id]: true,
							}));
						}

						map.on("error", (e) => {
							console.error("Map error:", e.error);
						});

						// Add click handler for vector tile features
						if (layer.onClick) {
							let selectedFeatureId: string | number | undefined;

							if (handleLayerClickRef.current[layer.id]) {
								selectedFeatureId = undefined;
								map.off(
									"click",
									layer.id,
									handleLayerClickRef.current[layer.id],
								);
							}

							const handleVectorTileClick = (e: maplibregl.MapMouseEvent) => {
								const features = map.queryRenderedFeatures(e.point, {
									layers: [layer.id],
								});
								if (!features.length) return;

								e.originalEvent?.stopPropagation();
								clearOtherSelections();

								if (selectedFeatureId !== undefined) {
									map.setFeatureState(
										{
											source: layer.id,
											id: selectedFeatureId,
											sourceLayer: layer.sourceLayer,
										},
										{ selected: false },
									);
								}

								selectedFeatureId = features[0].id;
								map.setFeatureState(
									{
										source: layer.id,
										id: selectedFeatureId,
										sourceLayer: layer.sourceLayer,
									},
									{ selected: true },
								);

								layer.onClick?.(features[0]);
							};

							handleLayerClickRef.current[layer.id] = handleVectorTileClick;

							map.on("click", layer.id, handleLayerClickRef.current[layer.id]);

							if (layer.cursor) {
								map.on("mouseenter", layer.id, () => {
									map.getCanvas().style.cursor = layer.cursor || "pointer";
								});
								map.on("mouseleave", layer.id, () => {
									map.getCanvas().style.cursor = "";
								});
							}
						}
					} catch (error) {
						console.error(`Error adding vector tile layer ${layer.id}:`, error);
					}
				} else {
					// GeoJSON handling
					const sourceConfig = {
						type: "geojson" as const,
						data: {
							type: "FeatureCollection",
							features: (layer as GeoJSONLayer).data?.features.map(
								(feature, index) => ({
									...feature,
									id: index,
								}),
							),
						},
						...(layer.type === "point" && layer.markerType === "circle"
							? {
									cluster: true,
									clusterRadius: 50,
									clusterMaxZoom: 16,
									clusterProperties: {
										count: ["+", ["get", "count"]],
									},
								}
							: {}),
					};

					if (!map.getSource(layer.id)) {
						map.addSource(
							layer.id,
							sourceConfig as maplibregl.GeoJSONSourceSpecification,
						);
					}

					// Handle different geometry types
					if (!map.getLayer(layer.id)) {
						const layerType =
							typeof layer.type === "function"
								? layer.type(
										(layer as GeoJSONLayer).data?.features[0] as Feature<
											Geometry,
											GeoJsonProperties
										>,
									)
								: layer.type;

						switch (layerType) {
							case "polygon":
								// Add fill layer
								map.addLayer({
									id: `${layer.id}-fill`,
									type: "fill",
									source: layer.id,
									paint: {
										"fill-color": [
											"case",
											["boolean", ["feature-state", "selected"], false],
											"#ffba08", // Highlight color
											layer.style.color || "#000000",
										],
										"fill-opacity": [
											"case",
											["boolean", ["feature-state", "selected"], false],
											0.8, // Highlight opacity
											0,
										],
									},
								});

								// Add outline layer
								map.addLayer({
									id: `${layer.id}-outline`,
									type: "line",
									source: layer.id,
									paint: {
										"line-color": [
											"case",
											["boolean", ["feature-state", "selected"], false],
											"#ffba08", // Highlight color
											layer.style.color || "#000000",
										],
										"line-width": layer.style.weight || 2,
										"line-opacity": layer.style.opacity || 1,
									},
								});

								// Add click handlers and cursor behavior
								if (layer.onClick || layer.cursor) {
									let selectedFeatureId: string | number | undefined;

									if (handleLayerClickRef.current[layer.id]) {
										selectedFeatureId = undefined;
										map.off("click", handleLayerClickRef.current[layer.id]);
									}

									// Click handler
									handleLayerClickRef.current[layer.id] = (
										e: maplibregl.MapMouseEvent,
									) => {
										const features = map.queryRenderedFeatures(e.point);
										if (!features.length) return;

										const topFeature = features[0];

										// If it's not from the current layer, exit
										if (topFeature.layer.id !== `${layer.id}-fill`) return;
										e.originalEvent?.stopPropagation();
										clearOtherSelections();

										if (selectedFeatureId !== undefined) {
											map.setFeatureState(
												{ source: layer.id, id: selectedFeatureId },
												{ selected: false },
											);
										}

										selectedFeatureId = topFeature.id;
										map.setFeatureState(
											{ source: layer.id, id: selectedFeatureId },
											{ selected: true },
										);

										layer.onClick?.(topFeature);
									};

									map.on("click", handleLayerClickRef.current[layer.id]);

									map.on("mouseenter", `${layer.id}-fill`, () => {
										map.getCanvas().style.cursor = layer.cursor || "pointer";
									});
									map.on("mouseleave", `${layer.id}-fill`, () => {
										map.getCanvas().style.cursor = "";
									});
								}
								break;

							case "line":
								map.addLayer({
									id: layer.id,
									type: "line",
									source: layer.id,
									paint: {
										"line-color": layer.style.color || "#000000",
										"line-width": layer.style.weight || 5,
										"line-opacity": layer.style.opacity || 1,
									},
								});

								map.addLayer({
									id: `${layer.id}-selected`,
									type: "line",
									source: `${layer.id}-selected-source`,
									paint: {
										"line-color": "#ffba08", // Highlight color
										"line-width": 9, // Make it thicker for visibility
										"line-opacity": layer.style.opacity || 1,
									},
								});

								if (layer.onClick) {
									let selectedLineId: string | number | undefined;
									const handleLineClick = (
										e: maplibregl.MapMouseEvent & {
											features?: maplibregl.MapGeoJSONFeature[];
										},
									) => {
										if (!e.features?.length) return;

										e.originalEvent?.stopPropagation();
										clearOtherSelections();

										if (selectedLineId !== undefined) {
											map.setFeatureState(
												{ source: layer.id, id: selectedLineId },
												{ selected: false },
											);
										}

										selectedLineId = e.features[0].id;
										map.setFeatureState(
											{ source: layer.id, id: selectedLineId },
											{ selected: true },
										);

										const source = map.getSource(
											`${layer.id}-selected-source`,
										) as maplibregl.GeoJSONSource;

										if (source) {
											source.setData({
												type: "FeatureCollection",
												features: [e.features[0]],
											});
										}

										layer.onClick?.(e.features[0]);
									};

									map.off("click", layer.id, handleLineClick);
									map.on("click", layer.id, handleLineClick);

									if (layer.cursor) {
										map.on("mouseenter", layer.id, () => {
											map.getCanvas().style.cursor = layer.cursor || "pointer";
										});
										map.on("mouseleave", layer.id, () => {
											map.getCanvas().style.cursor = "";
										});
									}
								}
								break;

							case "point":
								if (layer.markerType === "circle") {
									// Remove existing layers first
									const layersToRemove = [
										layer.id,
										`${layer.id}-clusters`,
										`${layer.id}-cluster-count`,
										`${layer.id}-selected-source`,
									];

									for (const id of layersToRemove) {
										if (map.getLayer(id)) {
											map.removeLayer(id);
										}
									}

									// Add selected source first
									if (!map.getSource(`${layer.id}-selected-source`)) {
										map.addSource(`${layer.id}-selected-source`, {
											type: "geojson",
											data: {
												type: "FeatureCollection",
												features: [],
											},
										});
									}

									// Move all existing symbol layers to the top
									const existingLayers = map.getStyle().layers || [];
									const symbolLayers = existingLayers.filter(
										(l) => l.type === "symbol" && !l.id.includes("cluster"),
									);

									// Remove symbol layers temporarily
									for (const layer of symbolLayers) {
										if (map.getLayer(layer.id)) {
											map.removeLayer(layer.id);
										}
									}
									const iconImage =
										layer.id === "flight-plan-cluster-layer"
											? [
													"step",
													["get", "point_count"],
													"flight-cluster-0", // Red cluster for flight plans
													5,
													"flight-cluster-100",
													10,
													"flight-cluster-500",
												]
											: [
													"step",
													["get", "point_count"],
													"circle-0", // Default green clusters
													5,
													"circle-100",
													10,
													"circle-500",
												];

									// Add main circle marker layer
									if (!map.getLayer(layer.id)) {
										map.addLayer({
											id: layer.id,
											type: "symbol",
											source: layer.id,
											minzoom: 0,
											maxzoom: 14, // Hide circles when zoomed in too much
											paint: {
												"text-color": "#ffffff",
											},
											layout: {
												// @ts-ignore
												"icon-image": iconImage,
												"icon-size": [
													"interpolate",
													["linear"],
													["zoom"],
													5,
													0.5,
													10,
													1.5,
												],
												"icon-allow-overlap": true,
												"text-allow-overlap": true,
												"text-field": ["get", "point_count_abbreviated"],
												"text-size": 14,
											},
										});
									}

									// Re-add symbol layers in their original order
									for (const symbolLayer of symbolLayers) {
										map.addLayer(symbolLayer);
									}

									// Update cluster configuration
									// if (!map.getLayer(`${layer.id}-clusters`)) {
									// 	map.addLayer({
									// 		id: `${layer.id}-clusters`,
									// 		type: "circle",
									// 		source: layer.id,
									// 		filter: ["has", "point_count"],
									// 		minzoom: 10, // Lower minzoom for earlier clustering
									// 		maxzoom: 16, // Adjust maxzoom for cluster visibility
									// 		paint: {
									// 			"circle-color": [
									// 				"step",
									// 				["get", "point_count"],
									// 				"#50AD0B", // Base color
									// 				5,
									// 				"#FFB800", // Yellow for 5+ flights
									// 				10,
									// 				"#FF4B4B", // Red for 10+ flights
									// 			],
									// 			"circle-radius": [
									// 				"step",
									// 				["get", "point_count"],
									// 				20, // Base size
									// 				5,
									// 				30,
									// 				10,
									// 				40,
									// 			],
									// 			"circle-stroke-width": 2,
									// 			"circle-stroke-color": "#ffffff",
									// 		},
									// 	});
									// }

									// Update cluster count display
									if (!map.getLayer(`${layer.id}-cluster-count`)) {
										map.addLayer({
											id: `${layer.id}-cluster-count`,
											type: "symbol",
											source: layer.id,
											filter: ["has", "point_count"],
											minzoom: 12, // Show counts at higher zoom levels
											layout: {
												"text-field": "{point_count_abbreviated}",
												"text-font": ["Open Sans Bold"],
												"text-size": 14,
												"text-allow-overlap": true,
											},
										});
									}

									// Add cluster click interaction
									map.on("click", `${layer.id}-clusters`, (e) => {
										const features = map.queryRenderedFeatures(e.point, {
											layers: [`${layer.id}-clusters`],
										});

										if (features[0]) {
											const clusterId = features[0].properties?.cluster_id;
											const source = map.getSource(
												layer.id,
											) as maplibregl.GeoJSONSource;

											source
												.getClusterExpansionZoom(clusterId)
												.then((zoom) => {
													const geometry = features[0]
														.geometry as GeoJSON.Point;
													map.easeTo({
														center: geometry.coordinates as [number, number],
														zoom: Math.min(zoom + 2, 18), // slight zoom buffer
														duration: 500,
													});
												})
												.catch(() => {
													// Silently handle zoom error
												});
										}
									});

									// Add click and cursor handlers
									if (layer.onClick || layer.cursor) {
										let selectedPointId: string | number | undefined;

										const handlePointClick = (
											e: maplibregl.MapMouseEvent & {
												features?: maplibregl.MapGeoJSONFeature[];
											},
										) => {
											if (!e.features?.length) return;

											e.originalEvent?.stopPropagation();
											clearOtherSelections();

											// Clear previous selection
											if (selectedPointId !== undefined) {
												map.setFeatureState(
													{ source: layer.id, id: selectedPointId },
													{ selected: false },
												);
											}

											// Clear selected source data
											const selectedSource = map.getSource(
												`${layer.id}-selected-source`,
											) as maplibregl.GeoJSONSource;

											if (selectedSource) {
												selectedSource.setData({
													type: "FeatureCollection",
													features: [],
												});
											}

											selectedPointId = e.features[0].id;
											map.setFeatureState(
												{ source: layer.id, id: selectedPointId },
												{ selected: true },
											);

											layer.onClick?.(e.features[0]);
										};

										// Remove existing handler before adding new one
										map.off("click", layer.id, handlePointClick);
										map.on("click", layer.id, handlePointClick);

										map.on("mouseenter", layer.id, () => {
											map.getCanvas().style.cursor = layer.cursor || "pointer";
										});
										map.on("mouseleave", layer.id, () => {
											map.getCanvas().style.cursor = "";
										});
									}
								} else {
									// For regular markers (non-circle type)
									// Remove existing layers first
									const layersToRemove = [
										layer.id,
										`${layer.id}-selected-source`,
									];

									for (const id of layersToRemove) {
										if (map.getLayer(id)) {
											map.removeLayer(id);
										}
									}

									// Add selected source first
									if (!map.getSource(`${layer.id}-selected-source`)) {
										map.addSource(`${layer.id}-selected-source`, {
											type: "geojson",
											data: {
												type: "FeatureCollection",
												features: [],
											},
										});
									}

									// Find the first circle layer to insert markers below it
									const firstCircleLayer = map
										.getStyle()
										.layers?.find(
											(l) =>
												l.type === "symbol" &&
												(l.id.includes("circle") ||
													l.id.includes("count-circles")),
										);

									// Add main marker layer BELOW circles
									if (!map.getLayer(layer.id)) {
										map.addLayer(
											{
												id: layer.id,
												type: "symbol",
												source: layer.id,
												layout: {
													"icon-image": layer.markerIcon || "default-marker",
													"icon-size": 1.2,
													"icon-allow-overlap": true,
													"text-field": layer.labelField
														? ["get", layer.labelField]
														: "",
													"text-size": 10,
													"text-offset": [0, -1],
													"text-anchor": "top",
													"text-allow-overlap": false,
												},
												paint: {
													"text-color": "#ffffff",
													"text-halo-color": "rgba(0, 0, 0, 0)",
													"text-halo-width": 1,
												},
											},
											firstCircleLayer?.id,
										); // Add below circle layers if they exist

										// Add click handler for the marker layer
										if (layer.onClick || layer.cursor) {
											let selectedMarkerId: string | number | undefined;

											const handleMarkerClick = (
												e: maplibregl.MapMouseEvent & {
													features?: maplibregl.MapGeoJSONFeature[];
												},
											) => {
												if (!e.features?.length) return;

												e.originalEvent?.stopPropagation();
												clearOtherSelections();

												// Clear previous selection
												if (selectedMarkerId !== undefined) {
													map.setFeatureState(
														{ source: layer.id, id: selectedMarkerId },
														{ selected: false },
													);
												}

												selectedMarkerId = e.features[0].id;
												map.setFeatureState(
													{ source: layer.id, id: selectedMarkerId },
													{ selected: true },
												);

												// Update selected source
												const selectedSource = map.getSource(
													`${layer.id}-selected-source`,
												) as maplibregl.GeoJSONSource;

												if (selectedSource) {
													selectedSource.setData({
														type: "FeatureCollection",
														features: [e.features[0]],
													});
												}

												layer.onClick?.(e.features[0]);
											};

											// Remove existing handler before adding new one
											map.off("click", layer.id, handleMarkerClick);
											map.on("click", layer.id, handleMarkerClick);

											// Add hover effects
											map.on("mouseenter", layer.id, () => {
												map.getCanvas().style.cursor =
													layer.cursor || "pointer";
											});
											map.on("mouseleave", layer.id, () => {
												map.getCanvas().style.cursor = "";
											});
										}
									}

									// Add selected source layer BELOW circles
									if (!map.getLayer(`${layer.id}-selected-source`)) {
										map.addLayer(
											{
												id: `${layer.id}-selected-source`,
												type: "symbol",
												source: `${layer.id}-selected-source`,
												layout: {
													"icon-image": "selected-marker",
													"icon-size": 1.2,
													"icon-allow-overlap": true,
													"text-field": layer.labelField
														? ["get", layer.labelField]
														: "",
													"text-size": 10,
													"text-offset": [0, -1],
													"text-anchor": "top",
													"text-allow-overlap": false,
												},
												paint: {
													"text-color": "#ffff",
													"text-halo-color": "rgba(0, 0, 0, 0)",
													"text-halo-width": 1,
												},
											},
											firstCircleLayer?.id,
										); // Add below circle layers if they exist
									}
								}
								break;
						}
					}
				}
			} catch (error) {
				console.error("Error adding layer:", error, {
					layerId: layer.id,
					layerType: layer.type,
					data: (layer as GeoJSONLayer).data,
				});
			}
		},
		[isMapLoaded, isStyleLoaded, setMapInstance, setLayerVisibility],
	);

	// Update the layers effect
	useEffect(() => {
		if (!mapRef.current || !isMapLoaded || !isStyleLoaded) return;

		const map = mapRef.current;

		const cleanup = () => {
			if (!map?.getLayer) return;

			// Get all existing layers from the map
			const mapStyle = map.getStyle();
			if (!mapStyle || !mapStyle.layers) return;

			// First remove all layers
			const layerIds = layers.map((layer) => layer.id);
			for (const layerId of layerIds) {
				const layerVariations = [
					`${layerId}-clusters`, // Remove cluster layer first
					`${layerId}-cluster-count`, // Remove cluster count layer
					layerId, // base layer
					`${layerId}-fill`, // polygon fill
					`${layerId}-outline`, // polygon outline
					`${layerId}-selected`, // selected state
					`${layerId}-selected-source`, // selected source layer
				];

				// Remove each layer variation if it exists
				for (const id of layerVariations) {
					if (map.getLayer(id)) {
						map.removeLayer(id);
					}
				}
			}

			// After ALL layers are removed, then remove sources
			for (const layerId of layerIds) {
				try {
					// Remove the selected source
					if (map.getSource(`${layerId}-selected-source`)) {
						map.removeSource(`${layerId}-selected-source`);
					}
					// Remove the main source
					if (map.getSource(layerId)) {
						map.removeSource(layerId);
					}
				} catch (error) {
					console.warn(`Failed to remove source ${layerId}:`, error);
				}
			}
		};

		// Clean up existing layers before adding new ones
		cleanup();

		// Add new layers if there are any
		if (layers && layers.length > 0) {
			for (const layer of layers) {
				addLayer(layer);
			}
		}

		return cleanup;
	}, [layers, isMapLoaded, isStyleLoaded, addLayer]);

	// Update markers effect to use addLayer
	useEffect(() => {
		if (markers && isMapLoaded) {
			addLayer({
				id: "markers",
				data: markers as FeatureCollection,
				type: "point",
				style: { color: "#00474F" },
				labelField: keyField,
				onClick: (feature) => handleMarkerClick(feature as unknown as T),
				markerType: "circle",
			} as MapLayer);
		}
	}, [markers, isMapLoaded, keyField, addLayer, handleMarkerClick]);

	// Update zones effect to use addLayer
	useEffect(() => {
		if (!mapRef.current || !isMapLoaded || !isStyleLoaded) return;

		if (
			geoJsonData &&
			activeZoneConfigArray &&
			activeZoneConfigArray.length > 0
		) {
			try {
				for (const zoneKey of activeZoneConfigArray) {
					if (zoneKey in ZONE_CONFIGS) {
						const zoneConfig =
							ZONE_CONFIGS[zoneKey as keyof typeof ZONE_CONFIGS];
						if (zoneConfig) {
							addLayer({
								id: `zones-${zoneKey}`,
								data: geoJsonData as FeatureCollection,
								type: "polygon",
								style: {
									color: zoneConfig.style.color,
									fillOpacity: zoneConfig.style.fillOpacity,
									weight: zoneConfig.style.weight,
									opacity: zoneConfig.style.opacity,
								},
							});
						}
					}
				}
			} catch (error) {
				console.error("Error adding zone layers:", error);
			}
		}
	}, [
		geoJsonData,
		activeZoneConfigArray,
		isMapLoaded,
		isStyleLoaded,
		addLayer,
	]);

	return (
		<MapContainer ref={mapContainer}>
			<ControlBar
				selectedLayer={selectedLayer}
				onLayerChange={onLayerChange}
				onZoneToggle={handleZoneToggle}
				activeZones={activeZones}
				mapRef={mapRef.current}
			/>
		</MapContainer>
	);
});

export default memo(
	CustomizedMapBase,
	arePropsEqual,
) as typeof CustomizedMapBase;
