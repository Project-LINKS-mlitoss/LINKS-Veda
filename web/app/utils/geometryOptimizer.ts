import * as turf from "@turf/turf";
import type { Feature, FeatureCollection, Geometry } from "geojson";

interface OptimizeOptions {
	tolerance?: number;
	highQuality?: boolean;
	removeDuplicates?: boolean;
	simplifyShapes?: boolean;
}

const defaultOptions: OptimizeOptions = {
	tolerance: 0.001,
	highQuality: false,
	removeDuplicates: true,
	simplifyShapes: true,
};

export function optimizeGeometries(
	featureCollection: FeatureCollection,
	options: OptimizeOptions = defaultOptions,
): FeatureCollection {
	if (!featureCollection?.features?.length) {
		return featureCollection;
	}

	let optimized = featureCollection;

	// Remove invalid features
	optimized = {
		type: "FeatureCollection",
		features: optimized.features.filter(
			(f: Feature<Geometry>) =>
				f?.geometry?.type &&
				"coordinates" in f.geometry &&
				f.geometry.coordinates,
		),
	};

	// Remove duplicate vertices if enabled
	if (options.removeDuplicates) {
		optimized = {
			type: "FeatureCollection",
			features: optimized.features.map((feature) => {
				if (feature.geometry.type === "Point") return feature;
				return turf.cleanCoords(feature as Feature) as Feature;
			}),
		};
	}

	// Simplify shapes if enabled
	if (options.simplifyShapes) {
		optimized = turf.simplify(optimized, {
			tolerance: options.tolerance,
			highQuality: options.highQuality,
		});
	}

	return optimized;
}

export function long2tile(lon: number, zoom: number): number {
	return Math.floor(((lon + 180) / 360) * 2 ** zoom);
}

export function lat2tile(lat: number, zoom: number): number {
	return Math.floor(
		((1 -
			Math.log(
				Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180),
			) /
				Math.PI) /
			2) *
			2 ** zoom,
	);
}

export function getGeoJSONBoundingBox(
	geojson: FeatureCollection,
): [number, number, number, number] {
	let minLon = Number.POSITIVE_INFINITY;
	let minLat = Number.POSITIVE_INFINITY;
	let maxLon = Number.NEGATIVE_INFINITY;
	let maxLat = Number.NEGATIVE_INFINITY;
	const validFeatures = geojson.features.filter(
		(f: Feature<Geometry>) =>
			f?.geometry?.type &&
			"coordinates" in f.geometry &&
			f.geometry.coordinates,
	);
	for (const feature of validFeatures) {
		if (!feature.geometry || !("coordinates" in feature.geometry)) continue;
		const coords = extractCoordinates(feature.geometry.coordinates);
		for (const [lon, lat] of coords) {
			minLon = Math.min(minLon, lon);
			minLat = Math.min(minLat, lat);
			maxLon = Math.max(maxLon, lon);
			maxLat = Math.max(maxLat, lat);
		}
	}
	return [minLon, minLat, maxLon, maxLat];
}

export function extractCoordinates(
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	coords: any,
): [number, number][] {
	if (typeof coords[0] === "number" && typeof coords[1] === "number") {
		return [[coords[0], coords[1]]];
	}
	let results: [number, number][] = [];
	for (const c of coords) {
		results = results.concat(extractCoordinates(c));
	}

	return results;
}
