import fs from "node:fs";
import Papa from "papaparse";
import { extractFileNameAndExtensionFromUrl } from "~/utils/stringUtils";

export const getExtension = (filename?: string) => {
	if (!filename?.includes(".")) return "";

	return filename
		.toLowerCase()
		.slice(filename.lastIndexOf(".") + 1, filename.length);
};

export const readFileFromUrlAsBuffer = async (
	url: string,
): Promise<ArrayBuffer> => {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch file from URL: ${url}`);
	}
	return await response.arrayBuffer();
};

export async function downloadFile(
	url: string,
	downloadPath: string,
): Promise<void> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch file from URL: ${response.statusText}`);
	}
	const buffer = await response.arrayBuffer();
	try {
		fs.writeFileSync(downloadPath, Buffer.from(buffer));
	} catch (err) {
		throw new Error(`Failed to save downloaded file to ${downloadPath}`);
	}
}

export async function parseCSVFromUrl(url: string): Promise<string[]> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch file from URL: ${response.statusText}`);
	}

	const csvText = await response.text();

	return new Promise((resolve, reject) => {
		Papa.parse(csvText, {
			header: true,
			skipEmptyLines: true,
			complete: (result) => {
				const fields = result.meta.fields || [];
				const jsonLines: string[] = [];

				for (const row of result.data as Record<string, string>[]) {
					const rowArray = fields.map(
						(key) => `"${key}": ${JSON.stringify(row[key])}`,
					);
					const jsonString = `{${rowArray.join(", ")}}`;
					jsonLines.push(jsonString);
				}

				resolve(jsonLines);
			},
			// biome-ignore lint/suspicious/noExplicitAny: FIXME
			error: (error: { message: any }) => {
				reject(new Error(`Failed to parse CSV: ${error.message}`));
			},
		});
	});
}

export async function downloadFileFromUrls(
	urls: { url: string; prefix?: string }[],
	isShowSaveOption = false,
) {
	try {
		for (const { url, prefix } of urls) {
			const response = await fetch(url);
			if (!response.ok) throw new Error(`Failed to download: ${url}`);

			const blob = await response.blob();
			const { baseName, extension } = extractFileNameAndExtensionFromUrl(url);
			const finalFileName = prefix
				? `${baseName}_${prefix}.${extension}`
				: `${baseName}.${extension}`;
			if ("showSaveFilePicker" in window && isShowSaveOption) {
				// biome-ignore lint/suspicious/noExplicitAny: FIXME
				const fileHandle = await (window as any).showSaveFilePicker({
					suggestedName: finalFileName,
					types: [
						{
							description: "File",
							accept: { [`application/${extension}`]: [`.${extension}`] },
						},
					],
				});

				const writable = await fileHandle.createWritable();
				await writable.write(blob);
				await writable.close();
			} else {
				const link = document.createElement("a");
				link.href = URL.createObjectURL(blob);
				link.download = finalFileName;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		}
		return;
	} catch (error) {
		console.error("Download failed:", error);
		if (error instanceof Error) {
			return error.name !== "AbortError" ? error.message : null;
		}

		return String(error);
	}
}
