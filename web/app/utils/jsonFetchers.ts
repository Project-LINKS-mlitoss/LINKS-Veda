type JsonArrayStreamFetcher = (
	url: string,
	abortController: AbortController,
) => AsyncGenerator<Record<string, unknown>[]>;

const retryFetch = (
	url: string,
	abortController?: AbortController,
	options: RequestInit = {},
	maxRetries = 3,
	timeout = 5000,
): Promise<Response> => {
	let retryCount = 0;

	const controller = abortController ?? new AbortController(); // Use a new local variable

	const executeRequest = (
		resolve: (value: Response) => void,
		reject: (reason: Error) => void,
		currentController: AbortController,
	): void => {
		if (retryCount >= maxRetries) {
			reject(new Error(`Failed after ${maxRetries} retries`));
			return;
		}

		const timer = setTimeout(() => {
			if (currentController.signal) {
				currentController.abort(); // Prevent undefined `abort`
			}
		}, timeout);

		const requestOptions: RequestInit = {
			...options,
			signal: currentController.signal,
		};

		fetch(url, requestOptions)
			.then((response) => {
				clearTimeout(timer);
				resolve(response);
			})
			.catch((error) => {
				clearTimeout(timer);

				if (error.name === "AbortError") {
					retryCount++;
					const newController = new AbortController();
					executeRequest(resolve, reject, newController);
				} else {
					reject(error);
				}
			});
	};

	return new Promise<Response>((resolve, reject) => {
		executeRequest(resolve, reject, controller);
	});
};

export const jsonlArrayStreamFetcher: JsonArrayStreamFetcher = async function* (
	url: string,
	abortController: AbortController,
) {
	const response = await retryFetch(url, abortController);
	const reader = response.body?.getReader();
	if (!reader) {
		return;
	}

	let buffer = "";
	const decoder = new TextDecoder();
	while (true) {
		// `reader.read()` gets stuck sometime before returning `done`, so need to check timeout.
		const timer = setTimeout(() => reader.cancel(), 5000);
		const { done, value } = await reader.read();
		clearTimeout(timer);

		if (done) {
			break;
		}

		buffer += decoder.decode(value, { stream: true });

		const lines = buffer.split("\n");
		if (lines.length === 1) {
			continue;
		}

		buffer = lines.pop() || "";

		const results: Record<string, unknown>[] = [];
		for (const line of lines) {
			try {
				results.push(JSON.parse(line));
			} catch (e) {
				console.warn(e);
			}
		}
		yield results;
	}

	if (buffer) {
		try {
			const parsed = JSON.parse(buffer);
			yield [parsed] as Record<string, unknown>[];
		} catch (e) {
			console.warn(e);
		}
	}
};

export const jsonArrayStreamFetcher: JsonArrayStreamFetcher = async function* (
	url: string,
) {
	const response = await fetch(url);
	if (!response.ok) {
		console.error(`Failed to fetch ${url}: ${response.statusText}`);
		return;
	}

	const json = await response.json();

	if (Array.isArray(json)) {
		yield json;
	} else {
		return;
	}
};

export const jsonFetcher = async (url: string) => {
	const response = await fetch(url);
	if (!response.ok) {
		console.error(`Failed to fetch ${url}: ${response.statusText}`);
		return null;
	}

	return response.json();
};
