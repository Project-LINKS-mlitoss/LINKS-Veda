import dayjs from "dayjs";

export const getNow = (): string => {
	return dayjs().toDate().toISOString();
};
