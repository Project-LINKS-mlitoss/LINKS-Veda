import { useState } from "react";

const useColumnResize = (minWidth: string, defaultWidth = "1fr") => {
	const [width, setWidth] = useState(defaultWidth);
	const [isCollapsed, setIsCollapsed] = useState(false);

	const toggle = () => {
		if (isCollapsed) {
			setWidth(defaultWidth);
		} else {
			setWidth(minWidth);
		}
		setIsCollapsed(!isCollapsed);
	};

	return { width, toggle, isCollapsed };
};

export default useColumnResize;
