import styled from "@emotion/styled";
import { useFetcher } from "@remix-run/react";
import { Progress } from "antd";
import * as React from "react";
import { Suspense, useEffect, useState } from "react";
import { CONTENT_FIELD_TYPE } from "~/commons/core.const";
import type { FeatureCollectionWithFilename } from "~/components/pages/Assets/types";
import type { DataTableChatType } from "~/components/pages/Chat/types";
import type { ItemField, ItemsResponse } from "~/models/items";
import type { ApiResponse } from "~/repositories/utils";
import { routes } from "~/routes/routes";

const GISMap = React.lazy(
	() => import("../../../../../molecules/Common/ViewerAsset/GISViewer/GISMap"),
);

interface AssetViewerProps {
	contentItem?: DataTableChatType;
}

const GISViewer: React.FC<AssetViewerProps> = ({ contentItem }) => {
	const fetch = useFetcher<ApiResponse<ItemsResponse>>();
	const [geoJsonData, setGeoJsonData] = useState<
		FeatureCollectionWithFilename | FeatureCollectionWithFilename[] | null
	>(null);
	const [loading, setLoading] = useState<boolean>(true);

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (contentItem) {
			setLoading(true);
			setGeoJsonData(null);
			fetch.load(
				`${routes.item}?modelId=${contentItem.contentId}&page=1&perPage=100`,
			);
		}
	}, [contentItem?.contentId]);

	useEffect(() => {
		if (fetch?.data?.status) {
			const data: ItemsResponse = fetch?.data?.data;
			const newFeatures: GeoJSON.Feature<
				GeoJSON.Geometry | null,
				GeoJSON.GeoJsonProperties
			>[] = [];
			let allGeometriesNull = true;

			for (const item of data?.items || []) {
				const properties: GeoJSON.GeoJsonProperties = {};
				let geometry: GeoJSON.Geometry | null = null;

				for (const field of contentItem?.schema?.fields || []) {
					const fieldData = item?.fields?.find(
						(f: ItemField) => f?.id === field?.id,
					);

					if (fieldData) {
						if (fieldData?.type === CONTENT_FIELD_TYPE.GEO) {
							geometry = JSON.parse(fieldData?.value) as GeoJSON.Geometry;
							if (geometry !== null) {
								allGeometriesNull = false;
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

			if (newFeatures.length && !allGeometriesNull) {
				setGeoJsonData({
					type: "FeatureCollection",
					features: newFeatures as GeoJSON.Feature<
						GeoJSON.Geometry,
						GeoJSON.GeoJsonProperties
					>[],
				});
			}
			setLoading(false);
		}
	}, [fetch.data, contentItem]);

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
							<GISMap geoJsonData={geoJsonData} />
						) : (
							<div className="invalid-data-geojson">
								Map cannot be displayed because your data is invalid !
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
