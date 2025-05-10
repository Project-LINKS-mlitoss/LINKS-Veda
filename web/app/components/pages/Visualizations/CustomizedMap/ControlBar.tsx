import { useParams } from "@remix-run/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TOKYO_COORDINATES, type ZONE_CONFIGS } from "~/commons/area.const";
import Select from "~/components/atoms/Select";
import { MAP_LAYERS, type MVTLayerProp, type MapLayerKey } from "../types";
import {
	Checkbox,
	ContainerInside,
	ControlBarWrapper,
	Gap,
	IconButton,
	IconWrapper,
	MiniboxContainer,
	MiniboxContent,
	MiniboxHeader,
	RelativeContainer,
	SpacedContainer,
	StyledText,
	SubSectionTitle,
	ZoneLabel,
	ZoneOptionContainer,
} from "./styled.js";

function ZoneOption({
	label,
	isChecked,
	onChange,
	isDarkMode,
}: Readonly<{
	zoneKey: string;
	label: string;
	isChecked: boolean;
	onChange: (checked: boolean) => void;
	isDarkMode: boolean;
}>) {
	const handleClick = () => {
		onChange(!isChecked);
	};

	return (
		<ZoneOptionContainer onClick={handleClick}>
			<Checkbox
				type="checkbox"
				checked={isChecked}
				onChange={(e) => onChange(e.target.checked)}
			/>
			<ZoneLabel isDarkMode={isDarkMode}>{label}</ZoneLabel>
		</ZoneOptionContainer>
	);
}

function LayerOption({
	label,
	onChange,
	isDarkMode,
}: Readonly<{
	zoneKey: string;
	label: string;
	onChange: (checked: boolean) => void;
	isDarkMode: boolean;
}>) {
	const [checked, setChecked] = useState(true);
	const handleClick = () => {
		setChecked(!checked);
		onChange(!checked);
	};

	return (
		<ZoneOptionContainer>
			<Checkbox type="checkbox" checked={checked} onClick={handleClick} />
			<ZoneLabel isDarkMode={isDarkMode}>{label}</ZoneLabel>
		</ZoneOptionContainer>
	);
}
interface ControlBarProps {
	selectedLayer: MapLayerKey;
	onLayerChange: (layer: MapLayerKey, action: "change") => void;
	onZoneToggle: (zone: keyof typeof ZONE_CONFIGS, enabled: boolean) => void;
	activeZones: Set<keyof typeof ZONE_CONFIGS>;
	mapRef: maplibregl.Map | null;
	layerVisibility?: { [key: string]: boolean }; // Required
	onLayerToggle?: (layer: string, action: "toggle", isVisible: boolean) => void; // Required
	meshEnabledStatuses?: {
		windSpeed: boolean;
		waveHeight: boolean;
		visibility: boolean;
		trafficVolume: boolean;
	};
	props?: MVTLayerProp[];
	onMeshSelect?: (meshName: string) => void;
	selectedMeshName?: string;
}

export function ControlBar({
	selectedLayer,
	onLayerChange,
	onZoneToggle,
	activeZones,
	mapRef,
	onLayerToggle,
	meshEnabledStatuses,
	onMeshSelect,
	selectedMeshName,
	props = [],
}: Readonly<ControlBarProps>) {
	const { useCaseId } = useParams();
	const [layerVisibility, setLayerVisibility] = useState<{
		[layerId: string]: boolean;
	}>({});

	const [activeMinibox, setActiveMinibox] = useState<
		| "layer"
		| "polygon"
		| "flag"
		| "path"
		| "uc14-layer-toggle"
		| "uc17-layer-toggle"
		| null
	>(useCaseId === "14" ? "uc14-layer-toggle" : null);
	const isDarkMode = MAP_LAYERS[selectedLayer].isDark;

	const handleMiniboxToggle = (
		minibox:
			| "layer"
			| "polygon"
			| "flag"
			| "path"
			| "uc14-layer-toggle"
			| "uc17-layer-toggle"
			| null,
	) => {
		setActiveMinibox((current) => (current === minibox ? null : minibox));
	};

	const handleCenter = () => {
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					mapRef?.flyTo({
						center: [position.coords.longitude, position.coords.latitude],
						zoom: 13,
						duration: 2000, // Duration in milliseconds
						essential: true, // This animation is considered essential for usability
					});
				},
				(error) => {
					console.error("Error getting location:", error);
					// Fallback to Tokyo coordinates if geolocation fails
					mapRef?.flyTo({
						center: [TOKYO_COORDINATES[1], TOKYO_COORDINATES[0]],
						zoom: 13,
						duration: 2000,
						essential: true,
					});
				},
			);
		} else {
			// Fallback for browsers that don't support geolocation
			mapRef?.flyTo({
				center: [TOKYO_COORDINATES[1], TOKYO_COORDINATES[0]],
				zoom: 13,
				duration: 2000,
				essential: true,
			});
		}
	};

	const handleVisibilityChange = useCallback(
		(layerId: string, isVisible: boolean) => {
			setLayerVisibility((prevState) => ({
				...prevState,
				[layerId]: isVisible,
			}));
			if (mapRef) {
				mapRef.setLayoutProperty(
					`${layerId}-layer`,
					"visibility",
					isVisible ? "visible" : "none",
				);
			}
		},
		[mapRef],
	);
	const handleMeshChange = useCallback(
		(meshName: string) => {
			onMeshSelect?.(meshName);
		},
		[onMeshSelect],
	);

	const initializeLayerVisibility = useCallback(() => {
		const initialVisibility: { [layerId: string]: boolean } = {};
		for (const prop of props) {
			initialVisibility[prop.id] = true;
		}
		setLayerVisibility(initialVisibility);
	}, [props]);

	useEffect(() => {
		if (props.length > 0 && Object.keys(layerVisibility).length === 0) {
			initializeLayerVisibility();
		}
	}, [props, layerVisibility, initializeLayerVisibility]);

	const handleLayerChange = useCallback(
		(layer: MapLayerKey) => {
			onLayerChange(layer, "change");
		},
		[onLayerChange],
	);

	const visibilityZones = useMemo(
		() =>
			props
				.filter((prop) => prop.isFiltering === true)
				.map((prop) => (
					<LayerOption
						key={`${prop.id}-zone-option`}
						zoneKey={prop.id}
						label={prop.title || prop.id}
						onChange={(checked) => {
							if (checked === true) {
								handleVisibilityChange(`${prop.id}`, true);
							} else {
								handleVisibilityChange(`${prop.id}`, false);
							}
						}}
						isDarkMode={isDarkMode}
					/>
				)),
		[props, isDarkMode, handleVisibilityChange],
	);
	useEffect(() => {
		const initialVisibility: {
			[layerId: string]: boolean;
		} = {};
		props.map((prop) => {
			initialVisibility[prop.id] = true;
		});

		if (JSON.stringify(initialVisibility) !== JSON.stringify(layerVisibility)) {
			setLayerVisibility(initialVisibility);
		}
	}, [props, layerVisibility]);

	return (
		<ControlBarWrapper>
			{useCaseId !== "14" && useCaseId !== "16" && useCaseId !== "17" && (
				<IconButton isDarkMode={isDarkMode} onClick={handleCenter}>
					<IconWrapper
						icon="crosshair"
						isDarkMode={isDarkMode}
						isActive={false}
					/>
				</IconButton>
			)}

			<IconButton
				isDarkMode={isDarkMode}
				onClick={() => handleMiniboxToggle("layer")}
			>
				<IconWrapper
					icon="mapTrifold"
					isDarkMode={isDarkMode}
					isActive={activeMinibox === "layer"}
				/>
			</IconButton>

			{useCaseId !== "14" && useCaseId !== "16" && useCaseId !== "17" && (
				<>
					<IconButton
						isDarkMode={isDarkMode}
						onClick={() => handleMiniboxToggle("flag")}
					>
						<IconWrapper
							icon="flag"
							isDarkMode={isDarkMode}
							isActive={activeMinibox === "flag"}
						/>
					</IconButton>

					<IconButton
						isDarkMode={isDarkMode}
						onClick={() => handleMiniboxToggle("path")}
					>
						<IconWrapper
							icon="path"
							isDarkMode={isDarkMode}
							isActive={activeMinibox === "path"}
						/>
					</IconButton>
				</>
			)}
			{useCaseId === "16" && (
				<IconButton
					isDarkMode={isDarkMode}
					onClick={() => handleMiniboxToggle("polygon")}
				>
					<IconWrapper
						icon="polygon"
						isDarkMode={isDarkMode}
						isActive={activeMinibox === "polygon"}
					/>
				</IconButton>
			)}
			{useCaseId === "17" && (
				<IconButton
					isDarkMode={isDarkMode}
					onClick={() => handleMiniboxToggle("uc17-layer-toggle")}
				>
					<IconWrapper
						icon="polygon"
						isDarkMode={isDarkMode}
						isActive={activeMinibox === "uc17-layer-toggle"}
					/>
				</IconButton>
			)}
			{useCaseId === "14" && (
				<IconButton
					isDarkMode={isDarkMode}
					onClick={() => handleMiniboxToggle("uc14-layer-toggle")}
				>
					<IconWrapper
						icon="blockOutlined"
						isDarkMode={isDarkMode}
						isActive={activeMinibox === "uc14-layer-toggle"}
						size="28px"
						style={{ opacity: "0.6" }}
					/>
				</IconButton>
			)}

			<RelativeContainer>
				{activeMinibox === "layer" && (
					<MiniboxContainer isDarkMode={isDarkMode}>
						<MiniboxHeader isDarkMode={isDarkMode}>
							<StyledText isDarkMode={isDarkMode}>背景地図</StyledText>
						</MiniboxHeader>

						<MiniboxContent isDarkMode={isDarkMode}>
							<SpacedContainer>
								<StyledText isDarkMode={isDarkMode}>
									Cyber Japan Maps
								</StyledText>
								<Gap />
								<ContainerInside>
									{Object.entries(MAP_LAYERS).map(([key, layer]) => (
										<ZoneOption
											key={key}
											zoneKey={key}
											label={(layer as (typeof MAP_LAYERS)[MapLayerKey]).name}
											isChecked={selectedLayer === key}
											onChange={() => handleLayerChange(key as MapLayerKey)}
											isDarkMode={isDarkMode}
										/>
									))}
								</ContainerInside>
							</SpacedContainer>
						</MiniboxContent>
					</MiniboxContainer>
				)}
			</RelativeContainer>

			<RelativeContainer>
				{activeMinibox === "polygon" && (
					<MiniboxContainer isDarkMode={isDarkMode}>
						<MiniboxHeader isDarkMode={isDarkMode}>
							<StyledText isDarkMode={isDarkMode}>
								小型無人機等飛行禁止法
							</StyledText>
						</MiniboxHeader>

						<MiniboxContent isDarkMode={isDarkMode}>
							<SpacedContainer>
								<ZoneOption
									zoneKey="red_zone"
									label="レッドゾーン"
									isChecked={activeZones.has("red_zone")}
									onChange={(checked) => {
										onZoneToggle("red_zone", checked);
									}}
									isDarkMode={isDarkMode}
								/>
								<ZoneOption
									zoneKey="yellow_zone"
									label="イエローゾーン"
									isChecked={activeZones.has("yellow_zone")}
									onChange={(checked) => {
										onZoneToggle("yellow_zone", checked);
									}}
									isDarkMode={isDarkMode}
								/>
							</SpacedContainer>

							<SubSectionTitle isDarkMode={isDarkMode}>航空法</SubSectionTitle>

							<SpacedContainer>
								<ZoneOption
									zoneKey="airport_surrounding"
									label="空港等周辺空域"
									isChecked={activeZones.has("airport_surrounding")}
									onChange={(checked) => {
										onZoneToggle("airport_surrounding", checked);
									}}
									isDarkMode={isDarkMode}
								/>
								<ZoneOption
									zoneKey="did_area"
									label="人口集中地区"
									isChecked={activeZones.has("did_area")}
									onChange={(checked) => {
										onZoneToggle("did_area", checked);
									}}
									isDarkMode={isDarkMode}
								/>
								<ZoneOption
									zoneKey="manned_aircraft_area"
									label="有人機発着エリア"
									isChecked={activeZones.has("manned_aircraft_area")}
									onChange={(checked) => {
										onZoneToggle("manned_aircraft_area", checked);
									}}
									isDarkMode={isDarkMode}
								/>
								<ZoneOption
									zoneKey="flight_Plan_Layers_tiles"
									label="飛行計画エリア"
									isChecked={activeZones.has("flight_Plan_Layers_tiles")}
									onChange={(checked) => {
										onZoneToggle("flight_Plan_Layers_tiles", checked);
									}}
									isDarkMode={isDarkMode}
								/>
								<ZoneOption
									zoneKey="test_flight_area"
									label="事故情報"
									isChecked={activeZones.has("test_flight_area")}
									onChange={(checked) => {
										onZoneToggle("test_flight_area", checked);
									}}
									isDarkMode={isDarkMode}
								/>
							</SpacedContainer>
						</MiniboxContent>
					</MiniboxContainer>
				)}
			</RelativeContainer>

			<RelativeContainer>
				{activeMinibox === "uc14-layer-toggle" && (
					<MiniboxContainer isDarkMode={isDarkMode}>
						<MiniboxHeader isDarkMode={isDarkMode}>
							<IconWrapper
								icon="blockOutlined"
								isDarkMode={isDarkMode}
								isActive={true}
								size="22px"
							/>
							<StyledText isDarkMode={isDarkMode}>マップレイヤー</StyledText>
						</MiniboxHeader>
						<MiniboxContent isDarkMode={isDarkMode}>
							<h3>メッシュレイヤー</h3>
							<SpacedContainer>
								<Select
									value={selectedMeshName}
									onSelect={(value) => handleMeshChange(value)}
									options={[
										{
											value: "none",
											label: "なし",
										},
										{
											value: "windSpeedMesh",
											label: "風速メッシュ",
											disabled: !meshEnabledStatuses?.windSpeed,
										},
										{
											value: "waveHeightMesh",
											label: "波高メッシュ",
											disabled: !meshEnabledStatuses?.waveHeight,
										},
										{
											value: "visibilityMesh",
											label: "視程メッシュ",
											disabled: !meshEnabledStatuses?.visibility,
										},
										{
											value: "congestionMesh",
											label: "混雑度メッシュ",
											disabled: !meshEnabledStatuses?.trafficVolume,
										},
									]}
									placeholder="メッシュを選択"
									defaultValue="none"
								/>
							</SpacedContainer>
						</MiniboxContent>
						<MiniboxContent isDarkMode={isDarkMode}>
							<h3>その他レイヤー</h3>
							<SpacedContainer>{visibilityZones}</SpacedContainer>
						</MiniboxContent>
					</MiniboxContainer>
				)}
			</RelativeContainer>

			<RelativeContainer>
				{activeMinibox === "uc17-layer-toggle" && (
					<MiniboxContainer isDarkMode={isDarkMode}>
						<MiniboxHeader isDarkMode={isDarkMode}>
							<StyledText isDarkMode={isDarkMode}>内航海運データ</StyledText>
						</MiniboxHeader>

						<MiniboxContent isDarkMode={isDarkMode}>
							<SpacedContainer>
								<ZoneOption
									zoneKey="loading-ports"
									label="装船港"
									isChecked={activeZones.has("loading-ports")}
									onChange={(checked) => {
										onZoneToggle("loading-ports", checked);
									}}
									isDarkMode={isDarkMode}
								/>
								<ZoneOption
									zoneKey="unloading-ports"
									label="卸船港"
									isChecked={activeZones.has("unloading-ports")}
									onChange={(checked) => {
										onZoneToggle("unloading-ports", checked);
									}}
									isDarkMode={isDarkMode}
								/>

								<ZoneOption
									zoneKey="shipping-routes"
									label="航路"
									isChecked={activeZones.has("shipping-routes")}
									onChange={(checked) => {
										onZoneToggle("shipping-routes", checked);
									}}
									isDarkMode={isDarkMode}
								/>
							</SpacedContainer>
						</MiniboxContent>
					</MiniboxContainer>
				)}
			</RelativeContainer>
		</ControlBarWrapper>
	);
}
