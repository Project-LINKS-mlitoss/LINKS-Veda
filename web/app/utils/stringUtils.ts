import dayjs from "dayjs";
import translate from "google-translate-api-x";
import { OUTPUT_TYPE } from "~/commons/core.const";

export const capitalizeFirstLetter = (input: string) => {
	return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
};

export const isUnicodeEncoded = (str: string): boolean => {
	return /\\u[\dA-Fa-f]{4}/.test(str);
};

export const decodeUnicode = (str: string): string => {
	return str.replace(/\\u([\dA-Fa-f]{4})/g, (match, grp) => {
		return String.fromCharCode(Number.parseInt(grp, 16));
	});
};

export const removeSlash = (str: unknown): unknown => {
	if (typeof str !== "string") return str;

	return str.replace(/\\\//g, "/");
};

export const getFileTypeFromFileName = (fileName: string): string => {
	const fileType = fileName.split(".").pop();

	return fileType ?? OUTPUT_TYPE.JSON;
};

export const removeFileExtension = (fileName: string): string => {
	return fileName.includes(".")
		? fileName.split(".").slice(0, -1).join(".")
		: fileName;
};

export const extractFileNameAndExtension = (
	fileName: string,
): { baseName: string; extension: string } => {
	const parts = fileName.split(/\.(?=[^\.]+$)/);
	if (parts.length < 2) {
		throw new Error("Invalid file name. No extension found.");
	}

	return { baseName: parts[0], extension: parts[1] };
};

export const extractFileNameAndExtensionFromUrl = (
	url: string,
): { baseName: string; extension: string } => {
	const encodedFileName = url.split("/").pop() || "download";
	const fileName = decodeURIComponent(encodedFileName);

	const dotIndex = fileName.indexOf(".");
	if (dotIndex === -1) {
		return { baseName: fileName, extension: "" };
	}

	return {
		baseName: fileName.substring(0, dotIndex),
		extension: fileName.substring(dotIndex + 1),
	};
};

export const generateFileNameByTimeStamp = (
	fileName: string,
	format = "YYYYMMDDHHmmss",
): string => {
	const timestamp = dayjs().format(format);

	return `${fileName}_${timestamp}`;
};

export const translateToEnglish = async (text: string): Promise<string> => {
	try {
		if (!text || typeof text !== "string") return "";
		const res = await translate(text, { to: "en" });
		return res.text;
	} catch (error) {
		console.error(error);
		return text;
	}
};

// keyword follow rule a-z0-9-_
export const normalizeName = (keyword: string): string => {
	try {
		if (!keyword || typeof keyword !== "string") return "";
		const cleaned = keyword
			.normalize("NFKD")
			.replace(/[^\w\s-]/g, "")
			.replace(/\s+/g, "-")
			.toLowerCase();

		return cleaned;
	} catch (error) {
		console.error(error);
		return "";
	}
};

export const convertKeyword = async (keyword: string): Promise<string> => {
	try {
		const translated = await translateToEnglish(keyword);
		return normalizeName(translated);
	} catch (error) {
		console.error("Error convert keyword:", error);
		return "";
	}
};
