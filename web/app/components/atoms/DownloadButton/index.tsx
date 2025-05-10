import fileDownload from "js-file-download";
import type React from "react";
import { type MouseEventHandler, useCallback } from "react";

import Button, { type ButtonProps } from "app/components/atoms/Button";
import Icon from "app/components/atoms/Icon";

interface Asset {
	id: string;
	fileName: string;
	url: string;
}

type DownloadButtonProps = {
	title?: string;
	selected?: Asset[];
	displayDefaultIcon?: boolean;
} & ButtonProps;

const DownloadButton: React.FC<DownloadButtonProps> = ({
	title,
	selected,
	displayDefaultIcon,
	...props
}) => {
	const handleDownload: MouseEventHandler<HTMLElement> | undefined =
		useCallback(async () => {
			selected?.map(async (s) => {
				const res = await fetch(s.url, {
					method: "GET",
				});
				const blob = await res.blob();
				fileDownload(blob, s.fileName);
			});
		}, [selected]);

	return (
		<Button
			icon={displayDefaultIcon && <Icon icon="download" />}
			onClick={handleDownload}
			disabled={!selected || selected.length <= 0}
			{...props}
		>
			{title ?? "ダウンロード"}
		</Button>
	);
};

export default DownloadButton;
