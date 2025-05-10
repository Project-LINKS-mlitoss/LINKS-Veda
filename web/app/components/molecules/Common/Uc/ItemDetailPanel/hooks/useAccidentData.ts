import type { Feature, GeoJsonProperties, Point } from "geojson";
import { useMemo } from "react";
import type { MeshItem } from "../types";

export function useAccidentData(
	accidents: Feature<Point, GeoJsonProperties>[] | undefined,
	selectedMesh?: MeshItem | null,
) {
	return useMemo(() => {
		if (!selectedMesh || !accidents) return [];

		return accidents.filter(
			(accident) =>
				accident.properties?.メッシュID === selectedMesh.properties.mesh_id,
		);
	}, [selectedMesh, accidents]);
}
