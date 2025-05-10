import type {
	Feature,
	FeatureCollection,
	GeoJsonProperties,
	Geometry,
} from "geojson";

export type LayerType = "point" | "line" | "polygon";

export interface LayerStyle {
	color?: string;
	weight?: number;
	opacity?: number;
	fillOpacity?: number;
}

export interface GeoJSONLayer {
	id: string;
	data: FeatureCollection;
	type:
		| LayerType
		| ((feature: Feature<Geometry, GeoJsonProperties>) => LayerType);
	style: LayerStyle;
	labelField?: string;
	markerIcon?: string;
	cursor?: string;
	onClick?: (feature: Feature<Geometry, GeoJsonProperties>) => void;
	cluster?: boolean;
	clusterMaxZoom?: number;
	clusterRadius?: number;
}
