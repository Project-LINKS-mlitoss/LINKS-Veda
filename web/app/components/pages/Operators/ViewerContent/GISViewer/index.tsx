import styled from "@emotion/styled";
import { useFetcher } from "@remix-run/react";
import { Progress } from "antd";
import * as React from "react";
import { Suspense, useEffect, useState } from "react";
import { CONTENT_FIELD_TYPE, type SelectRowIdT } from "~/commons/core.const";
import type { FeatureCollectionWithFilename } from "~/components/pages/Assets/types";
import type { DataTableContentType } from "~/components/pages/Content/types";
import type { ContentItem } from "~/models/content";
import type { ItemField, ItemsResponse } from "~/models/items";
import type { ApiResponse } from "~/repositories/utils";
import { routes } from "~/routes/routes";

const GISMap = React.lazy(
	() => import("../../../../molecules/Common/ViewerAsset/GISViewer/GISMap"),
);

interface GISViewerFilter {
	page: number;
	perPage: number;
}

interface AssetViewerProps {
	contentItem?: DataTableContentType | ContentItem;
	selectedRowId?: SelectRowIdT | null;
	filter?: GISViewerFilter;
	fetchData?: ApiResponse<ItemsResponse>;
}

const GISViewer: React.FC<AssetViewerProps> = ({
	contentItem,
	selectedRowId,
	filter: externalFilter,
	fetchData,
}) => {
	const fetch = useFetcher<ApiResponse<ItemsResponse>>();
	const [geoJsonData, setGeoJsonData] = useState<
		FeatureCollectionWithFilename | FeatureCollectionWithFilename[] | null
	>(null);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		if (!contentItem?.id) return;
		setLoading(true);
		setGeoJsonData(null);
		// If externalFilter or fetchData is active, skip the automatic fetch
		if (externalFilter || fetchData) return;

		fetch.load(`${routes.item}?modelId=${contentItem.id}&page=0&perPage=100`);
	}, [contentItem?.id, externalFilter, fetchData, fetch.load]);

	useEffect(() => {
		const dataSource = fetchData || fetch?.data;
		if (!dataSource?.status) return;

		const data: ItemsResponse = dataSource.data;
		const newFeatures: GeoJSON.Feature<
			GeoJSON.Geometry,
			GeoJSON.GeoJsonProperties
		>[] = [];
		let allGeometriesNull = true;

		try {
			for (const item of data?.items || []) {
				const properties: GeoJSON.GeoJsonProperties = { id: item.id };
				let geometry: GeoJSON.Geometry | null = null;

				for (const field of contentItem?.schema?.fields || []) {
					const fieldData = item?.fields?.find(
						(f: ItemField) => f?.id === field?.id,
					);
					if (!fieldData) continue;

					if (fieldData.type === CONTENT_FIELD_TYPE.GEO) {
						try {
							geometry = JSON.parse(fieldData.value) as GeoJSON.Geometry;
							if (geometry) {
								allGeometriesNull = false;
								newFeatures.push({
									type: "Feature",
									properties,
									geometry,
								});
							}
						} catch (e) {
							console.error("Failed to parse GeoJSON:", e);
						}
					} else {
						properties[field.key] = fieldData.value;
					}
				}
			}

			if (newFeatures.length && !allGeometriesNull) {
				setGeoJsonData({
					type: "FeatureCollection",
					features: newFeatures,
				});
			} else {
				setGeoJsonData(null);
			}
		} catch (error) {
			console.error("Error processing GeoJSON data:", error);
			setGeoJsonData(null);
		} finally {
			setLoading(false);
		}
	}, [fetchData, fetch?.data, contentItem]);

	if (!contentItem) return null;

	return (
		<GISViewerS>
			<Suspense fallback={null}>
				{loading ? (
					<div className="rotate-path">
						<Progress
							type="circle"
							percent={75}
							format={() => null}
							className="process"
						/>
					</div>
				) : (
					<>
						{geoJsonData ? (
							<GISMap geoJsonData={geoJsonData} selectedRowId={selectedRowId} />
						) : (
							<div className="invalid-data-geojson">
								Map cannot be displayed because your data is invalid or empty!
							</div>
						)}
					</>
				)}
			</Suspense>
		</GISViewerS>
	);
};
export default GISViewer;

const GISViewerS = styled.div`
  height: 100%;
  width: 100%;

  .rotate-path {
	height: 100%;
	width: 100%;
	display: flex;
    align-items: center;
    justify-content: center;

    .ant-progress-circle-path {
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
  }

  .invalid-data-geojson {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;
