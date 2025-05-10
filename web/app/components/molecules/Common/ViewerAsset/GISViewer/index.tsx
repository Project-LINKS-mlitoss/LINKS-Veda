import styled from "@emotion/styled";
import type { FeatureCollection } from "geojson";
import * as React from "react";
import { Suspense, useEffect, useState } from "react";
import shp from "shpjs";
import jp from "~/commons/locales/jp";
import Icon from "~/components/atoms/Icon";
import Spin from "~/components/atoms/Spin";
import WrapViewer from "~/components/molecules/Common/WrapViewer";
import {
	type FeatureCollectionWithFilename,
	FileType,
} from "~/components/pages/Assets/types";
import type { AssetItem } from "~/models/asset";
import { fetchFileData } from "../utils";

const GISMap = React.lazy(() => import("./GISMap"));

interface AssetViewerProps {
	assetItem: AssetItem;
}

const GISViewer: React.FC<AssetViewerProps> = ({ assetItem }) => {
	const [geoJsonData, setGeoJsonData] = useState<
		FeatureCollectionWithFilename | FeatureCollectionWithFilename[] | null
	>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const url = assetItem?.url;
		const fileType = url.split(".").pop();
		setGeoJsonData(null);
		setLoading(true);

		const fetchData = async (): Promise<void> => {
			try {
				if (fileType === FileType.GEOJSON) {
					const arrayBuffer = await fetchFileData(url);
					const data: FeatureCollection = JSON.parse(
						new TextDecoder().decode(arrayBuffer),
					);
					setGeoJsonData(data);
				} else if (fileType === FileType.SHP) {
					const arrayBuffer = await fetchFileData(url);
					const data = (await shp(arrayBuffer)) as
						| FeatureCollectionWithFilename
						| FeatureCollectionWithFilename[];
					setGeoJsonData(data);
				}
			} catch (error) {
				console.error(`Error loading ${fileType} file:`, error);
			}
			setLoading(false);
		};

		if (url) {
			fetchData();
		}
	}, [assetItem]);

	return (
		<WrapViewer
			title={jp.common.gisViewer}
			icon={<Icon icon="folderViewer" size={16} />}
		>
			<WrapMap>
				{loading ? (
					<Spin indicator={<Icon icon="loading" size={48} />} />
				) : (
					<Suspense fallback={null}>
						{geoJsonData && <GISMap geoJsonData={geoJsonData} />}
					</Suspense>
				)}
			</WrapMap>
		</WrapViewer>
	);
};

export default GISViewer;

const WrapMap = styled.div`
	height: 100%;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
`;
