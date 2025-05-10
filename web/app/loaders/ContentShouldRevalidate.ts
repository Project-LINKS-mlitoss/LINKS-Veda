import type { ShouldRevalidateFunction } from "@remix-run/react";
import { ACTION_TYPES_CONTENT } from "~/models/content";

export const shouldRevalidate: ShouldRevalidateFunction = ({
	actionResult,
	defaultShouldRevalidate,
}) => {
	if (actionResult?.actionType === ACTION_TYPES_CONTENT.SAVE) {
		return false;
	}

	return defaultShouldRevalidate;
};
