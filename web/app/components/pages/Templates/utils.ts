export const generateRedirectUrlTemplate = (
	fullPath: string,
	operatorId: string,
) => {
	if (fullPath.includes("operatorId=")) {
		return fullPath.replace(/operatorId=[^&]*/, `operatorId=${operatorId}`);
	}
	const separator = fullPath.includes("?") ? "&" : "?";
	return `${fullPath}${separator}operatorId=${operatorId}`;
};
