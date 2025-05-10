import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import notification from "~/components/atoms/Notification";

export const updateMultipleSearchParams = (
	searchParams: URLSearchParams,
	setSearchParams: (params: URLSearchParams) => void,
	updates: Record<string, string | null>,
) => {
	const params = new URLSearchParams(searchParams.toString());

	for (const [key, value] of Object.entries(updates)) {
		if (value) {
			params.set(key, value);
		} else {
			params.delete(key);
		}
	}

	setSearchParams(params);
};

export function formatFileSize(bytes: number): string {
	const units = ["B", "KB", "MB", "GB", "TB"];
	let index = 0;
	let size = bytes;

	while (size >= 1024 && index < units.length - 1) {
		size /= 1024;
		index++;
	}

	if (index === 0) {
		return `${Math.round(size)} ${units[index]}`;
	}

	const formattedSize = Number.parseFloat(size.toFixed(2))
		.toString()
		.replace(/\.?0+$/, "");

	return `${formattedSize} ${units[index]}`;
}

export function formatDate(
	dateString: string | undefined,
	timeZone = "Asia/Tokyo",
	dateFormat = "yyyy/MM/dd",
): string {
	if (!dateString) return "";

	try {
		const date = toZonedTime(dateString, timeZone);
		return format(date, dateFormat);
	} catch (error) {
		console.warn("Error parsing date:", error);
		return "";
	}
}

export function formatDateToUTC(
	dateString: string,
	dateSeparator = "-",
): string {
	const date = new Date(dateString);

	if (Number.isNaN(date.getTime())) {
		throw new Error("Invalid date format");
	}

	const year = date.getUTCFullYear();
	const month = String(date.getUTCMonth() + 1).padStart(2, "0");
	const day = String(date.getUTCDate()).padStart(2, "0");
	const hours = String(date.getUTCHours()).padStart(2, "0");
	const minutes = String(date.getUTCMinutes()).padStart(2, "0");

	const dateFormatted = [day, month, year].join(dateSeparator);

	return `${dateFormatted} ${hours}:${minutes}`;
}

export const formatValue = (
	value: string | number | boolean | null | undefined,
): string => {
	if (value === null || value === undefined || value === "") {
		return "-";
	}
	if (typeof value === "boolean") {
		return value ? "true" : "false";
	}

	return String(value);
};

export const showNotification = (
	status: boolean,
	action: string,
	error?: string,
) => {
	if (status) {
		notification.success({
			message: `${action}`,
			placement: "topRight",
		});
	} else {
		notification.error({
			message: `${action}`,
			description: error,
			placement: "topRight",
		});
	}
};

export const calculateMinWidths = (
	maxSize: number,
	minWidthLeftCenterParam: number,
	minWidthRight: number,
) => ({
	minWidthLeftCenter: (minWidthLeftCenterParam / maxSize) * 100,
	minWidthRight: (minWidthRight / maxSize) * 100,
});

export const togglePanelSize = (
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	panelRef: React.RefObject<any>,
	minWidth: number,
	defaultSize: number,
) => {
	const panel = panelRef.current;
	if (panel) {
		const minWidthParsed = Number.parseFloat(minWidth.toFixed(10));
		if (panel.getSize() > minWidthParsed) {
			panel.resize(minWidthParsed);
		} else {
			panel.resize(defaultSize);
		}
	}
};

export function getFileNameFromUrl(assetUrl?: string): string {
	if (!assetUrl) return "";
	const urlSplit = assetUrl.split("/");
	return decodeURIComponent(urlSplit[urlSplit.length - 1] || "");
}
