import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";

export const useDraggable = (
	type: string,
	index: number,
	moveItem: (dragIndex: number, hoverIndex: number) => void,
) => {
	const ref = useRef<HTMLDivElement>(null);

	const [, drop] = useDrop({
		accept: type,
		hover: (item: { index: number }) => {
			if (!ref.current) return;
			const dragIndex = item.index;
			const hoverIndex = index;
			if (dragIndex === hoverIndex) return;

			moveItem(dragIndex, hoverIndex);
			item.index = hoverIndex;
		},
	});

	const [, drag, preview] = useDrag({
		type,
		item: { index },
	});

	drop(ref);
	preview(ref);

	return { drag, ref };
};
