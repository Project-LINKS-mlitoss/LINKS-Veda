// @ts-nocheck
export async function loadJSONL(url: string, cb) {
	const response = await fetch(url);
	const reader = response.body?.getReader();
	if (!reader) {
		throw new Error("Response body not readable");
	}

	const decoder = new TextDecoder("utf-8");
	let buffer = "";

	async function process({ done, value }) {
		if (done) {
			if (buffer.trim()) {
				try {
					const json = JSON.parse(buffer);
					cb(json);
				} catch (error) {
					console.error("Error parsing JSONL:", error, buffer);
				}
			}
			return; // End processing
		}

		buffer += decoder.decode(value, { stream: true });

		// Process each line by splitting it with a line break
		let boundary: number | undefined;

		// biome-ignore lint: <making linting changes to this block of code, messes the functionality- Need Investigation>
		while ((boundary = buffer.indexOf("\n")) >= 0) {
			const line = buffer.slice(0, boundary).trim(); // Extract 1 line
			buffer = buffer.slice(boundary + 1); // Hold the rest next
			if (line) {
				try {
					const json = JSON.parse(line);
					cb(json);
				} catch (error) {
					console.error("Error parsing JSONL:", error, line);
				}
			}
		}

		// Continue reading the next chunk
		return reader.read().then(process);
	}

	await reader.read().then(process);
}
