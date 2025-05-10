export const getGraphContentLabel = (content: string) => {
	switch (content) {
		case "windSpeedAve":
			return "最大風速 (m/s)";
		case "waveHeightAve":
			return "最大波高 (m)";
		case "visibilityAve":
			return "最低視程 (m)";
		default:
			return "";
	}
};

export const getRefBeforeData = (graphContent: string, currentItem) => {
	if (!currentItem) return null;
	switch (graphContent) {
		case "windSpeedAve":
			return Number(currentItem["発航中止基準　渡航前　風速_1"]);
		case "waveHeightAve":
			return Number(currentItem["発航中止基準　渡航前　波高_1"]);
		case "visibilityAve":
			return Number(
				currentItem[
					"発航中止基準　渡航前　霧による視程障害を考慮した「水平方向の見通し距離」_1"
				],
			);
		default:
			return "";
	}
};

export const getRefDuringData = (graphContent: string, currentItem) => {
	if (!currentItem) return null;
	switch (graphContent) {
		case "windSpeedAve":
			return Number(currentItem["発航中止基準　渡航中　風速_1"]);
		case "waveHeightAve":
			return Number(currentItem["発航中止基準　渡航中　波高_1"]);
		case "visibilityAve":
			return Number(
				currentItem[
					"発航中止基準　渡航中　霧による視程障害を考慮した「水平方向の見通し距離」_1"
				],
			);
		default:
			return "";
	}
};
