import L, { LatLngBounds } from "leaflet";
import type React from "react";
import { useEffect } from "react";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

import styled from "@emotion/styled";
import type { Position } from "geojson";
import type { SelectRowIdT } from "~/commons/core.const";
import type { FeatureCollectionWithFilename } from "~/components/pages/Assets/types";
import ErrorBoundaryGIS from "./ErrorBoundaryGIS";

interface MapProps {
	geoJsonData: FeatureCollectionWithFilename | FeatureCollectionWithFilename[];
	selectedRowId?: SelectRowIdT | null;
}

const ZOOM_MAP = 7;
const ZOOM_MAP_CLEAR = 20;
const defaultStyle = {
	color: "black",
	fillColor: "black",
	weight: 3,
	fillOpacity: 0.2,
};

const getFeatureStyle = (feature: GeoJSON.Feature | undefined) => {
	return {
		fillColor: feature?.properties?.fill || defaultStyle.fillColor,
		weight: feature?.properties?.["stroke-width"] || defaultStyle.weight,
		color: feature?.properties?.stroke || defaultStyle.color,
		fillOpacity:
			feature?.properties?.["fill-opacity"] || defaultStyle.fillOpacity,
	};
};

const UpdateMapCenter: React.FC<MapProps> = ({
	geoJsonData,
	selectedRowId,
}) => {
	const map = useMap();

	useEffect(() => {
		if (geoJsonData) {
			const bounds = new LatLngBounds([]);
			const features = Array.isArray(geoJsonData)
				? geoJsonData.flatMap((data) => data.features)
				: geoJsonData.features;

			const processCoordinates = (
				coords: Position | Position[] | Position[][],
			): void => {
				if (Array.isArray(coords[0])) {
					for (const nestedCoords of coords as Position[][]) {
						processCoordinates(nestedCoords);
					}
				} else if (coords.length >= 2) {
					const latLng: [number, number] = [
						coords[1] as number,
						coords[0] as number,
					];
					bounds.extend(latLng);
				}
			};

			for (const feature of features) {
				const geometry = feature?.geometry;

				if (
					geometry?.type === "Point" ||
					geometry?.type === "LineString" ||
					geometry?.type === "Polygon"
				) {
					processCoordinates(geometry?.coordinates);
				} else if (
					geometry?.type === "MultiPoint" ||
					geometry?.type === "MultiLineString" ||
					geometry?.type === "MultiPolygon"
				) {
					for (const coords of geometry.coordinates) {
						processCoordinates(coords);
					}
				}
			}

			const selectedFeature = features.find(
				(feature) =>
					selectedRowId?.id && feature.properties?.id === selectedRowId?.id,
			);

			if (!selectedFeature) {
				const center = bounds.getCenter();
				map.setView([center.lat, center.lng], map.getZoom());
			} else {
				if (selectedFeature?.geometry) {
					const { geometry } = selectedFeature;

					const calculateBounds = (
						coords: Position | Position[] | Position[][] | Position[][][],
					): LatLngBounds => {
						const bounds = new LatLngBounds([]);

						const processCoordinates = (
							coords: Position | Position[] | Position[][] | Position[][][],
						): void => {
							if (Array.isArray(coords[0])) {
								for (const nestedCoords of coords as
									| Position[][]
									| Position[][][]) {
									processCoordinates(nestedCoords);
								}
							} else if (coords.length >= 2) {
								const latLng: [number, number] = [
									coords[1] as number,
									coords[0] as number,
								];
								bounds.extend(latLng);
							}
						};

						processCoordinates(coords);
						return bounds;
					};

					if (geometry.type === "Point") {
						const coordinates = geometry.coordinates as Position;
						const latLng: [number, number] = [coordinates[1], coordinates[0]];
						map.setView(latLng, ZOOM_MAP_CLEAR);
					} else if (
						geometry.type === "LineString" ||
						geometry.type === "Polygon" ||
						geometry.type === "MultiPoint" ||
						geometry.type === "MultiLineString" ||
						geometry.type === "MultiPolygon"
					) {
						const bounds = calculateBounds(geometry.coordinates);
						map.fitBounds(bounds, {
							padding: [ZOOM_MAP_CLEAR, ZOOM_MAP_CLEAR],
						});
					}
				}
			}
		}
	}, [geoJsonData, selectedRowId, map]);

	return null;
};

const GISMap: React.FC<MapProps> = ({ geoJsonData, selectedRowId }) => {
	return (
		<ErrorBoundaryGIS>
			<MapInside>
				<MapContainer
					center={[51.505, -0.09]}
					zoom={ZOOM_MAP}
					style={{ height: "100%", width: "100%" }}
				>
					<TileLayer
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					/>
					{geoJsonData && (
						<>
							<GeoJSON
								data={Array.isArray(geoJsonData) ? geoJsonData[0] : geoJsonData}
								style={getFeatureStyle}
								pointToLayer={(feature, latlng) => {
									return L.marker(latlng);
								}}
								onEachFeature={(feature, layer) => {
									if (feature.properties) {
										const propertiesTable = Object.entries(feature.properties)
											.map(
												([key, value]) => `
											<tr>
												<td style="border: 1px solid #0000000F; padding: 4px;">
													<strong>${key}</strong>
												</td>
												<td style="border: 1px solid #0000000F; padding: 4px;">
													${value}
												</td>
											</tr>
											`,
											)
											.join("");

										const popupContent = `
											<table style="width: 100%; border-collapse: collapse;">
												<tbody>
													${propertiesTable}
												</tbody>
											</table>
										`;

										layer.bindPopup(popupContent, { maxWidth: 400 });
									}
								}}
							/>
							<UpdateMapCenter
								geoJsonData={geoJsonData}
								selectedRowId={selectedRowId}
							/>
						</>
					)}
				</MapContainer>
			</MapInside>
		</ErrorBoundaryGIS>
	);
};

export default GISMap;

const MapInside = styled.div`
  height: 100%;
  width: 100%;
`;
