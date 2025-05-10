import { CONTENT_FIELD_TYPE, MAX_DISPLAY_FIELD } from "~/commons/core.const";
import type { ContentField } from "~/models/content";

export const getMaxContentField = (
	data: ContentField[],
	isExcludeGeoField = true,
): ContentField[] => {
	const filteredData = isExcludeGeoField
		? data.filter((field) => field?.type !== CONTENT_FIELD_TYPE.GEO)
		: data;

	return filteredData.slice(0, MAX_DISPLAY_FIELD);
};
