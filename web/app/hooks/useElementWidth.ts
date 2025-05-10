import { useEffect, useState } from "react";

const useElementWidth = (elementId: string): number => {
	const [elementWidth, setElementWidth] = useState(0);

	useEffect(() => {
		const element = document.getElementById(elementId);
		if (!element) return;

		setElementWidth(element.offsetWidth);

		const resizeObserver = new ResizeObserver(() => {
			setElementWidth(element.offsetWidth);
		});

		resizeObserver.observe(element);

		return () => {
			resizeObserver.disconnect();
		};
	}, [elementId]);

	return elementWidth;
};

export default useElementWidth;
