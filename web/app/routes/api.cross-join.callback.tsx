import fs from "node:fs";
import path from "node:path";
import { type ActionFunctionArgs, json } from "@remix-run/node";
import {
	CONTENT_CALLBACK_API_STATUS,
	CONTENT_IMPORT_STRATEGY_TYPE,
	OUTPUT_TYPE,
} from "~/commons/core.const";
import { SETTING_TYPE_CROSS_TAB } from "~/components/pages/Operators/types";
import { logger } from "~/logger";
import { OPERATOR_TYPE } from "~/models/templates";
import { prisma } from "~/prisma";
import { ServiceFactory } from "~/services/serviceFactory";
import {
	decodeUnicode,
	isUnicodeEncoded,
	removeSlash,
} from "~/utils/stringUtils";

interface ContentProperty {
	name: string;
	type: string;
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	properties: any;
}
interface ContentProperties {
	countData: ContentProperty;
	crossTabData: ContentProperty;
}

interface Payload {
	ticketId: string | null;
	schema?: {
		// NOTE: This field is returned from MB so don't change it
		properties?: ContentProperties;
	};
	data?: {
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		countData: any;
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		crossTabData: any;
	};
}

const operatorService = ServiceFactory.getOperatorService();

export async function action({ request }: ActionFunctionArgs) {
	const TEMP_FILE_DIR = process.env.VITE_TMP_PATH || "tmp";
	const outputType: string = OUTPUT_TYPE.JSON;
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
			message: "API cross join callback",
			data: payload,
		});
		ticketId = payload.ticketId || "";

		config = await prisma.crossJoinContentConfigs.findFirst({
			where: { ticketId: ticketId },
			select: {
				id: true,
				configJson: true,
				modelId: true,
			},
		});

		if (!config) {
			const result = { status: "error", message: "Config not found" };
			logResponseError(result);

			return json(result, 404);
		}

		await updateCrossJoinContentConfigStatus(
			ticketId,
			CONTENT_CALLBACK_API_STATUS.IN_PROGRESS,
		);

		if (!payload.schema || !payload.data) {
			await updateCrossJoinContentConfigStatus(
				ticketId,
				CONTENT_CALLBACK_API_STATUS.FAILED,
			);
			const result = { status: "error", message: "Invalid data" };
			logResponseError(result);

			return json(result, 400);
		}

		const { modelId, configJson } = config;
		if (typeof configJson !== "string") {
			const result = { status: "error", message: "Invalid configJson format" };
			logResponseError(result);

			return json(result, 400);
		}
		const configJsonParse = JSON.parse(configJson);
		const crossType = configJsonParse.setting.type;
		let fileData = "";
		const data =
			crossType === SETTING_TYPE_CROSS_TAB.TOTAL_AVERAGE
				? payload.data.countData
				: payload.data.crossTabData;
		const newData = formatJSONData(data);
		fileData = JSON.stringify(newData);

		if (!fs.existsSync(TEMP_FILE_DIR)) {
			fs.mkdirSync(TEMP_FILE_DIR);
		}
		const fileName = `${ticketId}.${outputType}`;
		const filePath = path.join(TEMP_FILE_DIR, fileName);
		fs.writeFileSync(filePath, fileData);
		const formData = new FormData();
		formData.append("file", new Blob([fs.readFileSync(filePath)]));
		formData.append("strategy", CONTENT_IMPORT_STRATEGY_TYPE.INSERT);
		formData.append("mutateSchema", "true"); // NOTE: This field is defined in CMS so don't change it
		formData.append("format", "json");

		const contentService = ServiceFactory.getContentService();
		const result = await contentService.importData(modelId, formData);
		if (!result.status) {
			const response = { status: "error", message: result.error };
			await updateCrossJoinContentConfigStatus(
				ticketId,
				CONTENT_CALLBACK_API_STATUS.FAILED,
			);
			logResponseError(response);

			return json(response, 500);
		}

		await updateCrossJoinContentConfigStatus(
			ticketId,
			CONTENT_CALLBACK_API_STATUS.DONE,
		);

		return json({ status: "ok", message: "Data was successfully updated" });
	} catch (error) {
		console.log("API cross join error", error);
		logger.error({
			message: "API cross join callback failed",
			err: error,
		});
		await updateCrossJoinContentConfigStatus(
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
				OPERATOR_TYPE.CROSS_TAB,
			);
	}
}

function formatJSONData(
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	data: any,
) {
	return data.map(
		(
			// biome-ignore lint/suspicious/noExplicitAny: FIXME
			item: any,
		) => {
			// biome-ignore lint/suspicious/noExplicitAny: FIXME
			const newItem: Record<string, any> = {};
			for (const key in item) {
				const tmpKey = isUnicodeEncoded(key)
					? (removeSlash(decodeUnicode(key)) as string)
					: key;
				const value = isUnicodeEncoded(item[key])
					? decodeUnicode(item[key])
					: item[key];
				newItem[tmpKey] = removeSlash(value);
			}

			return newItem;
		},
	);
}

async function updateCrossJoinContentConfigStatus(
	ticketId: string,
	status: CONTENT_CALLBACK_API_STATUS,
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	optionalData?: Record<string, any>,
) {
	try {
		const updateData = { status, ...(optionalData || {}) };
		await prisma.crossJoinContentConfigs.updateMany({
			where: { ticketId: ticketId },
			data: updateData,
		});
	} catch (e) {
		logger.error({
			message: "API cross join callback: update callback status failed",
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
