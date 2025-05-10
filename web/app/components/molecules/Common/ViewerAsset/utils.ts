export const fetchFileData = async (path: string): Promise<ArrayBuffer> => {
	const response = await fetch(path);
	if (!response.ok) throw new Error("Failed to fetch file");
	return response.arrayBuffer();
};
