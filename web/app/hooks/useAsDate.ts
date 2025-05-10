import { useMemo } from "react";

export const useAsDate = (date: Date | string | undefined | null) => {
	return useMemo(() => {
		return date ? new Date(date) : undefined;
	}, [date]);
};
