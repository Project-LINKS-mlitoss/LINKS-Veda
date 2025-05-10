import type { ShouldRevalidateFunction } from "@remix-run/react";
import { ACTION_TYPES_CONTENT } from "~/models/content";

export const shouldRevalidate: ShouldRevalidateFunction = ({
	actionResult,
	defaultShouldRevalidate,
}) => {
	if (
		actionResult?.actionType === ACTION_TYPES_CONTENT.RENAME ||
		actionResult?.actionType === ACTION_TYPES_CONTENT.CREATE_ASSET ||
		actionResult?.actionType === ACTION_TYPES_CONTENT.PUBLISH ||
		actionResult?.actionType === ACTION_TYPES_CONTENT.CREATE_ASSET_VISUALIZE ||
		actionResult?.actionType === ACTION_TYPES_CONTENT.PUBLISH_VISUALIZE ||
		actionResult?.actionType === ACTION_TYPES_CONTENT.CREATE_CHAT ||
		actionResult?.actionType === ACTION_TYPES_CONTENT.DUPLICATE
	) {
		return false;
	}

	return defaultShouldRevalidate;
};
