import { logger } from "~/logger";

export async function retryWithExponentialBackoff<T>(
	fn: () => Promise<T>,
	retries = 3,
	baseDelay = 100,
	factor = 2,
): Promise<T> {
	let attempt = 0;
	while (true) {
		try {
			return await fn();
		} catch (error) {
			attempt++;
			if (attempt > retries) {
				throw error;
			}
			const jitter = Math.random() * baseDelay;
			const delay = baseDelay * factor ** (attempt - 1) + jitter;
			logger.warn(
				`Attempt ${attempt} failed. Retrying in ${delay.toFixed(0)}ms...`,
			);
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}
}
