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

interface Payload {
	ticketId: string | null;
	schema?: {
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		properties?: any;
	};
	data?: {
		type?: string;
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		features?: any;
	};
}

const operatorService = ServiceFactory.getOperatorService();

export async function action({ request }: ActionFunctionArgs) {
	const TEMP_FILE_DIR = process.env.VITE_TMP_PATH || "tmp";
	const outputType: string = OUTPUT_TYPE.GEOJSON;
	let payload: Payload = { ticketId: null };
	let ticketId = payload.ticketId || "";
	let config = null;
	try {
		if (request.method !== "POST") {
			const result = { status: false, message: "Method not allowed" };
			logResponseError(result);

			return json(result, 405);
		}

		payload = await request.json();
		logger.info({
			message: "API spatial join callback",
			data: payload,
		});
		ticketId = payload.ticketId || "";

		config = await prisma.spatialJoinContentConfigs.findFirst({
			where: { ticketId: ticketId },
			select: {
				id: true,
				schemaId: true,
				modelId: true,
			},
		});

		if (!config) {
			const result = { status: "error", message: "Config not found" };
			logResponseError(result);

			return json(result, 404);
		}

		await updateSpatialJoinContentConfigStatus(
			ticketId,
			CONTENT_CALLBACK_API_STATUS.IN_PROGRESS,
		);

		if (!payload.schema || !payload.data) {
			await updateSpatialJoinContentConfigStatus(
				ticketId,
				CONTENT_CALLBACK_API_STATUS.FAILED,
			);
			const result = { status: "error", message: "Invalid data" };
			logResponseError(result);

			return json(result, 400);
		}

		const { modelId, schemaId } = config;
		let fileData = "";
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
		const createContentFieldResult = await operatorService.createContentFields(
			schemaId,
			newContent,
			true,
		);
		const createContentFieldResponse = await createContentFieldResult.json();
		if (!createContentFieldResponse.status) {
			await updateSpatialJoinContentConfigStatus(
				ticketId,
				CONTENT_CALLBACK_API_STATUS.FAILED,
			);
			return json(
				{
					status: "error",
					message: createContentFieldResponse.error,
				},
				500,
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
		formData.append("geometryFieldKey", DEFAULT_GEOMETRY_FIELD_KEY);
		formData.append("format", "geoJson");

		const contentService = ServiceFactory.getContentService();
		const result = await contentService.importData(modelId, formData);
		if (!result.status) {
			const response = { status: "error", message: result.error };
			await updateSpatialJoinContentConfigStatus(
				ticketId,
				CONTENT_CALLBACK_API_STATUS.FAILED,
			);
			logResponseError(response);

			return json(response, 500);
		}

		await updateSpatialJoinContentConfigStatus(
			ticketId,
			CONTENT_CALLBACK_API_STATUS.DONE,
		);

		return json({ status: "ok", message: "Data was successfully updated" });
	} catch (error) {
		logger.error({
			message: "API cross join callback failed",
			err: error,
		});
		await updateSpatialJoinContentConfigStatus(
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
				OPERATOR_TYPE.SPATIAL_JOIN,
			);
	}
}

function formatGEOJSONData(
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	data: any,
) {
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
			if (Object.hasOwn(feature.properties, key)) {
				const newKey = removeSlash(
					isUnicodeEncoded(key) ? decodeUnicode(key) : key,
				) as string;
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

async function updateSpatialJoinContentConfigStatus(
	ticketId: string,
	status: CONTENT_CALLBACK_API_STATUS,
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	optionalData?: Record<string, any>,
) {
	try {
		const updateData = { status, ...(optionalData || {}) };
		await prisma.spatialJoinContentConfigs.updateMany({
			where: { ticketId: ticketId },
			data: updateData,
		});
	} catch (e) {
		logger.error({
			message: "API spatial join callback: update callback status failed",
			err: e,
		});
	}
}

// biome-ignore lint/suspicious/noExplicitAny: FIXME
function logResponseError(payload: any) {
	logger.error({
		message: "[RESPONSE] API cross join callback",
		response: payload,
	});
}
