import fs from "node:fs";
import path from "node:path";
import { type ActionFunctionArgs, json } from "@remix-run/node";
import {
	CONTENT_CALLBACK_API_STATUS,
	CONTENT_FIELD_TYPE,
	CONTENT_IMPORT_STRATEGY_TYPE,
	DEFAULT_GEOMETRY_CRS,
	DEFAULT_GEOMETRY_FIELD_KEY,
	OUTPUT_TYPE,
} from "~/commons/core.const";
import { logger } from "~/logger";
import type { ContentI } from "~/models/operators";
import { OPERATOR_TYPE } from "~/models/templates";
import { prisma } from "~/prisma";
import { ServiceFactory } from "~/services/serviceFactory";
import {
	decodeUnicode,
	isUnicodeEncoded,
	removeSlash,
} from "~/utils/stringUtils";

const operatorService = ServiceFactory.getOperatorService();

export async function action({ request }: ActionFunctionArgs) {
	const TEMP_FILE_DIR = process.env.VITE_TMP_PATH || "tmp";
	let outputType: string = OUTPUT_TYPE.JSON;
	let payload = { ticketId: null, schema: null, data: null };
	let ticketId = payload.ticketId || "";
	let config = null;
	try {
		if (request.method !== "POST") {
			return json({ status: false, message: "Method not allowed" }, 405);
		}

		payload = await request.json();
		logger.info({
			message: "API preprocess callback",
			data: payload,
		});
		ticketId = payload.ticketId || "";

		config = await prisma.preprocessContentConfigs.findFirst({
			where: { ticketId: ticketId },
			select: {
				id: true,
				schemaId: true,
				modelId: true,
				outputType: true,
			},
		});

		if (!config) {
			return json({ status: "error", message: "Config not found" }, 404);
		}

		await updatePreprocessContentConfigStatus(
			ticketId,
			CONTENT_CALLBACK_API_STATUS.IN_PROGRESS,
		);

		if (!payload.schema || !payload.data) {
			await updatePreprocessContentConfigStatus(
				ticketId,
				CONTENT_CALLBACK_API_STATUS.FAILED,
			);

			return json({ status: "error", message: "Invalid data" }, 400);
		}

		const { modelId, schemaId } = config;
		outputType = config.outputType;
		let fileData: string;

		switch (outputType) {
			case OUTPUT_TYPE.JSON: {
				const { newData } = formatJSONData(payload.data);
				fileData = JSON.stringify(newData);
				break;
			}
			case OUTPUT_TYPE.GEOJSON: {
				const { newData } = formatGEOJSONData(payload.data);
				newData.name = modelId;
				newData.crs = DEFAULT_GEOMETRY_CRS;
				fileData = JSON.stringify(newData);
				const operatorService = ServiceFactory.getOperatorService();
				const newContent: ContentI = {
					type: "object",
					properties: {
						[DEFAULT_GEOMETRY_FIELD_KEY]: {
							keyword: DEFAULT_GEOMETRY_FIELD_KEY,
							type: CONTENT_FIELD_TYPE.GEO,
						},
					},
				};
				const createContentFieldResult =
					await operatorService.createContentFields(schemaId, newContent, true);
				const createContentFieldReResRtResponse =
					await createContentFieldResult.json();
				if (!createContentFieldReResRtResponse.status) {
					await updatePreprocessContentConfigStatus(
						ticketId,
						CONTENT_CALLBACK_API_STATUS.FAILED,
					);
					return json(
						{
							status: "error",
							message: createContentFieldReResRtResponse.error,
						},
						500,
					);
				}
				break;
			}
			default:
				await updatePreprocessContentConfigStatus(
					ticketId,
					CONTENT_CALLBACK_API_STATUS.FAILED,
				);
				return json(
					{ status: "error", message: "Unsupported outputType" },
					400,
				);
		}

		if (!fs.existsSync(TEMP_FILE_DIR)) {
			fs.mkdirSync(TEMP_FILE_DIR);
		}
		const fileName = `${ticketId}.${outputType}`;
		const filePath = path.join(TEMP_FILE_DIR, fileName);
		fs.writeFileSync(filePath, fileData);
		const formData = new FormData();
		formData.append("file", new Blob([fs.readFileSync(filePath)]));
		formData.append("strategy", CONTENT_IMPORT_STRATEGY_TYPE.INSERT);
		formData.append("mutateSchema", "true");
		if (outputType === OUTPUT_TYPE.GEOJSON) {
			formData.append("geometryFieldKey", DEFAULT_GEOMETRY_FIELD_KEY);
			formData.append("format", "geoJson");
		} else {
			formData.append("format", "json");
		}

		const contentService = ServiceFactory.getContentService();
		const result = await contentService.importData(modelId, formData);
		if (!result.status) {
			await updatePreprocessContentConfigStatus(
				ticketId,
				CONTENT_CALLBACK_API_STATUS.FAILED,
			);
			return json({ status: "error", message: result.error }, 500);
		}

		await updatePreprocessContentConfigStatus(
			ticketId,
			CONTENT_CALLBACK_API_STATUS.DONE,
		);

		return json({ status: "ok", message: "Data was successfully updated" });
	} catch (error) {
		logger.error({
			message: "API preprocess callback failed",
			err: error,
		});
		await updatePreprocessContentConfigStatus(
			ticketId,
			CONTENT_CALLBACK_API_STATUS.FAILED,
		);

		return json({ status: "error", message: "Internal Server Error" }, 500);
	} finally {
		const fileName = `${payload.ticketId}.${outputType}`;
		const filePath = path.join(TEMP_FILE_DIR, fileName);
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
		}
		if (config)
			await operatorService.prepareNextWorkFlowExecutionStep(
				config.id,
				OPERATOR_TYPE.PRE_PROCESSING,
			);
	}
}

// biome-ignore lint/suspicious/noExplicitAny: FIXME
function formatJSONData(data: any[]) {
	const newData = data.map((item) => {
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		const newItem: Record<string, any> = {};
		let index = 1;
		for (const key in item) {
			const tmpKey = isUnicodeEncoded(key)
				? (removeSlash(decodeUnicode(key)) as string)
				: key;
			const value = isUnicodeEncoded(item[key])
				? decodeUnicode(item[key])
				: item[key];
			newItem[tmpKey] = removeSlash(value);
			index++;
		}
		return newItem;
	});

	return { newData };
}

// biome-ignore lint/suspicious/noExplicitAny: FIXME
function formatGEOJSONData(data: any) {
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	const newFeatures = data.features.map((feature: any) => {
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		const newItem: Record<string, any> = {
			...feature,
			properties: {},
		};

		if (Object.hasOwn(newItem, "id")) {
			newItem.id = undefined;
		}

		for (const key in feature.properties) {
			if (key === "id") {
				feature.properties.id = undefined;
			} else {
				const newKey = isUnicodeEncoded(key)
					? (removeSlash(decodeUnicode(key)) as string)
					: key;
				const value = feature.properties[key];
				const finalValue = isUnicodeEncoded(value)
					? decodeUnicode(value)
					: value;
				newItem.properties[newKey] = removeSlash(finalValue);
			}
		}

		return newItem;
	});

	return { newData: { ...data, features: newFeatures } };
}

async function updatePreprocessContentConfigStatus(
	ticketId: string,
	status: CONTENT_CALLBACK_API_STATUS,
) {
	try {
		await prisma.preprocessContentConfigs.updateMany({
			where: { ticketId: ticketId },
			data: { status },
		});
	} catch (e) {
		logger.error({
			message: "API preprocess callback: update callback status failed",
			err: e,
		});
	}
}
