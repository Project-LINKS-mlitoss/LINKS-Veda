import { json } from "@remix-run/node";
import type { ApiResponse } from "~/repositories/utils";

export function validate(
	condition: boolean,
	errorMessage: string,
): ApiResponse<null> | null {
	if (condition) {
		return json(
			{ status: false, error: errorMessage },
			{ status: 400 },
		) as unknown as ApiResponse<null>;
	}
	return null;
}

export function validateV2(
	condition: boolean,
	errorMessage: string,
): Response | null {
	if (condition) {
		return json({ status: false, error: errorMessage }, { status: 400 });
	}
	return null;
}

// JR貨物輸送実績データ向けに正規化
export const serializeWaypoint = (p: string) =>
	p
		.replace("貨物ターミナル", "（タ）")
		.replace("オフレールステーション", "ＯＲＳ");
