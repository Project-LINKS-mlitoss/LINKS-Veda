import { DefaultCurrent, DefaultPageSize } from "~/components/molecules/Common";

export const getListParams = (
	request: Request,
): { keyword: string; page: number; perPage: number } => {
	const url = new URL(request.url);

	const keyword = url.searchParams.get("keyword") || "";
	const page = Math.max(
		Number(url.searchParams.get("page")) || DefaultCurrent,
		1,
	);
	const perPage = Math.max(
		Number(url.searchParams.get("perPage")) || DefaultPageSize,
		1,
	);

	return { keyword, page, perPage };
};

export async function fetchWithTimeout(
	url: string,
	body: object,
	method = "POST",
	timeoutMs = 30000,
): Promise<Response> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const response = await fetch(url, {
			method,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
			signal: controller.signal,
		});

		clearTimeout(timeout);
		return response;
	} catch (
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		error: any
	) {
		clearTimeout(timeout);

		if (error.name === "AbortError") {
			throw new Error("Request timeout");
		}

		throw error;
	}
}
