import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { logger } from "~/logger";
import { ServiceFactory } from "~/services/serviceFactory";

export async function loader({ params }: LoaderFunctionArgs) {
	try {
		const contentId = params.contentId;

		if (!contentId) {
			return json({ status: false, message: "Missing content_id" }, 400);
		}

		const contentService = ServiceFactory.getContentService();
		const data = await contentService.formatContent(contentId);
		if (!data.status) {
			return json({ status: "error", message: data.error }, 500);
		}

		const items = data.data.items;
		if (!items) return json({}, 200);

		return json(items);
	} catch (error) {
		logger.error({
			message: "API get content detail failed",
			err: error,
		});
		return json({ status: "error", message: "Internal Server Error" }, 500);
	}
}
