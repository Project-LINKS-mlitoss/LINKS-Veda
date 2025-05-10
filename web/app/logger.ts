import pino from "pino";

const logger = pino({
	messageKey: "message",
	formatters: {
		level(label: string) {
			return { severity: label.toUpperCase() };
		},
	},
	base: null,
	timestamp: pino.stdTimeFunctions.isoTime,
});

export { logger };
