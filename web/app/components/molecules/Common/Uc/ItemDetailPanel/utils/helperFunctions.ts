import { booleanPointInPolygon, point, polygon } from "@turf/turf";
import { Feature, Polygon } from "geojson";
import type { UAVFlightPlanFeature } from "~/components/pages/Visualizations/types";
import type { UAVPolygon } from "../types";

// COMMON-This function gets the points which are in the same boundaries as the cordinations of polygons.
export const filterPointsInsidePolygon = (
	points: UAVFlightPlanFeature[],
	polygon: UAVPolygon,
): UAVFlightPlanFeature[] => {
	return points.filter((feature) => {
		if (feature.geometry?.type === "Point") {
			const pt = point(feature.geometry.coordinates);
			return booleanPointInPolygon(pt, polygon);
		}
		return false;
	});
};
