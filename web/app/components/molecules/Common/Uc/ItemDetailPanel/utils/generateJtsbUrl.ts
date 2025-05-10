export function generateJtsbUrl(filename: string) {
	if (filename === "N/A") return null;
	const baseUrlInci = "https://jtsb.mlit.go.jp/ship/rep-inci/";
	const baseUrlAcci = "https://jtsb.mlit.go.jp/ship/rep-acci/";

	// 正規表現でファイル名の先頭部分（MI, MA, keibi）と年を抽出
	const cleanedFilename = filename.trim();
	const regex = /^(MI|MA|keibi)(\d{4})[-\d_]*/;
	const match = regex.exec(cleanedFilename);

	if (!match) {
		console.error("file format is incorrect", filename);
		return null;
	}

	const [_, prefix, year] = match;

	// URLのベースを決定
	const baseUrl = prefix === "MA" ? baseUrlAcci : baseUrlInci;

	// 完全なURLを返す
	const bomRemovedFilename = filename.replace(/^\uFEFF/, "");
	return `${baseUrl}${year}/${bomRemovedFilename}`;
}
