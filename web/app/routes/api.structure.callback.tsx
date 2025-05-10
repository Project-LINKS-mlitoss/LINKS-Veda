import fs from "node:fs";
import path from "node:path";
import { type ActionFunctionArgs, json } from "@remix-run/node";
import {
	CONTENT_CALLBACK_API_STATUS,
	CONTENT_IMPORT_STRATEGY_TYPE,
	OUTPUT_TYPE,
} from "~/commons/core.const";
import { logger } from "~/logger";
import type { ContentItemDetail } from "~/models/content";
import { OPERATOR_TYPE } from "~/models/templates";
import { prisma } from "~/prisma";
import { MbRepository } from "~/repositories/mbRepository";
import type { ErrorResponse } from "~/repositories/utils";
import { ServiceFactory } from "~/services/serviceFactory";

const operatorService = ServiceFactory.getOperatorService();
const contentService = ServiceFactory.getContentService();

export async function action({ request }: ActionFunctionArgs) {
	const TEMP_FILE_DIR = process.env.VITE_TMP_PATH || "tmp";
	let payload = { ticketId: null, schema: null, data: null, confidence: null };
	let ticketId = payload.ticketId || "";
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	let config: any = null;

	try {
		if (request.method !== "POST") {
			return json({ status: false, message: "Method not allowed" }, 405);
		}

		payload = await request.json();
		logger.info({
			message: "API structure callback",
			data: payload,
		});
		const data = Array.isArray(payload.data) ? payload.data : [payload.data];
		const confidence = payload.confidence;
		ticketId = payload.ticketId || "";

		config = await prisma.contentConfigs.findFirst({
			where: { ticketId: ticketId },
			select: {
				id: true,
				modelId: true,
			},
		});

		if (!config) {
			return json({ status: "error", message: "Config not found" }, 404);
		}

		const { modelId } = config;

		await updateContentConfigStatus(
			ticketId,
			CONTENT_CALLBACK_API_STATUS.IN_PROGRESS,
		);
		if (!fs.existsSync(TEMP_FILE_DIR)) {
			fs.mkdirSync(TEMP_FILE_DIR);
		}
		const fileName = `${ticketId}.${OUTPUT_TYPE.JSON}`;
		const filePath = path.join(TEMP_FILE_DIR, fileName);
		fs.writeFileSync(filePath, JSON.stringify(data));
		const formData = new FormData();
		formData.append("file", new Blob([fs.readFileSync(filePath)]));
		formData.append("strategy", CONTENT_IMPORT_STRATEGY_TYPE.INSERT);
		formData.append("mutateSchema", "true");
		formData.append("format", "json");

		const result = await contentService.importData(modelId, formData);
		if (!result.status) {
			await updateContentConfigStatus(
				ticketId,
				CONTENT_CALLBACK_API_STATUS.FAILED,
			);
			return json({ status: "error", message: result.error }, 500);
		}

		const contentData = await contentService.getContentItems(modelId, true);
		if (!contentData.status || !contentData.data) {
			await updateContentConfigStatus(
				ticketId,
				CONTENT_CALLBACK_API_STATUS.FAILED,
			);
			return json(
				{ status: "error", message: (contentData as ErrorResponse).error },
				500,
			);
		}
		const confidenceData = contentData.data.items.map(
			(item: ContentItemDetail) => ({
				itemId: item.id ?? "",
				metadata: JSON.stringify(confidence),
			}),
		);
		await saveContentItemConfidence(confidenceData);

		// Check ticketId status after 2s for MB update status of ticket
		setTimeout(async () => {
			if (ticketId) {
				const mbRepository = new MbRepository();
				const mbResult = await mbRepository.checkTicketStatus(ticketId);
				logger.info({
					message:
						"API structure callback start check ticketId status after 2s",
					data: mbResult,
				});
				if (
					mbResult?.status &&
					"ticketStatus" in mbResult &&
					mbResult?.ticketStatus === CONTENT_CALLBACK_API_STATUS.DONE
				) {
					await updateContentConfigStatus(
						ticketId,
						CONTENT_CALLBACK_API_STATUS.DONE,
					);
				}
			}
		}, 2000);

		return json({ status: "ok", message: "Data was successfully updated" });
	} catch (error) {
		logger.error({
			message: "API structure callback failed",
			err: error,
		});
		await updateContentConfigStatus(
			ticketId,
			CONTENT_CALLBACK_API_STATUS.FAILED,
		);

		return json({ status: "error", message: "Internal Server Error" }, 500);
	} finally {
		const fileName = `${payload.ticketId}.${OUTPUT_TYPE.JSON}`;
		const filePath = path.join(TEMP_FILE_DIR, fileName);
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
		}
		if (config) {
			// Waiting for check ticketId status and update status of ticket
			setTimeout(async () => {
				logger.info({
					message:
						"API structure callback start prepare NextWorkFlow Execution Step after check ticketId status",
					data: config,
				});
				await operatorService.prepareNextWorkFlowExecutionStep(
					config.id,
					OPERATOR_TYPE.DATA_STRUCTURE,
				);
			}, 3000);
		}
	}
}

async function saveContentItemConfidence(
	data: {
		itemId: string;
		metadata: string;
	}[],
) {
	return prisma.contentItemConfidence.createMany({
		data: data,
	});
}

async function updateContentConfigStatus(
	ticketId: string,
	status: CONTENT_CALLBACK_API_STATUS,
) {
	try {
		await prisma.contentConfigs.updateMany({
			where: { ticketId: ticketId },
			data: { status },
		});
	} catch (e) {
		logger.error({
			message: "API structure callback: update callback status failed",
			err: e,
		});
	}
}
