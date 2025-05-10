import { DEFAULT_REGION } from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import { formatDate } from "~/components/molecules/Common/utils";
import type { ContentItem } from "~/models/content";

export enum MODE_TEMPLATE {
	USE = "Use",
	EDITING = "Editing",
	CREATE = "create",
}

export type FieldType = { type: string; value: string };

export type SettingT = {
	name: string;
	useCase: string;
	isPublish: boolean;
	contents: (ContentItem | null)[];
};

export enum MODE_DATASET_COMPONENT {
	PREVIEW = "PREVIEW",
	CREATE_EDIT = "CREATE_EDIT",
}

export enum METADATA_KEY {
	SPECIFICATION = "specification",
	METADATA = "metadata",
	CONTENT_METADATA = "contentMetadata",
}
export interface Field {
	key: string;
	label: string;
	type: "input" | "textarea";
	disabled: boolean;
	value: string;
	placeholder: string;
}

export const defaultMetaData: Field[] = [
	{
		key: "id",
		label: "管理ID",
		type: "input",
		value: generateProjectId(),
		placeholder: generateProjectId(),
		disabled: true,
	},
	{
		key: "title",
		label: "タイトル（データセット名称）",
		type: "input",
		placeholder: jp.common.typeSomething,
		value: "",
		disabled: true,
	},
	{
		key: "description",
		label: "説明",
		type: "textarea",
		placeholder:
			"データの作成にあたっては、紙で保管された報告書をスキャンしてPDF化し、LINKS Vedaを使用しました。LINKS Vedaによるデータ作成の精度は紙資料の保存状態や記入状況に依存し、データの完全性や正確性を保証するものではありません。https://www.mlit.go.jp/links/本データは政府標準利用規約（第2.0版）に準拠しています。また、クリエイティブ・コモンズ・ライセンスの表示4.0国際と互換性があるとともに、利用者がOpen Data CommonsによるODC BY又はODbLでの利用を希望する場合に、それを妨げるものではありません。",
		value:
			"データの作成にあたっては、紙で保管された報告書をスキャンしてPDF化し、LINKS Vedaを使用しました。LINKS Vedaによるデータ作成の精度は紙資料の保存状態や記入状況に依存し、データの完全性や正確性を保証するものではありません。https://www.mlit.go.jp/links/本データは政府標準利用規約（第2.0版）に準拠しています。また、クリエイティブ・コモンズ・ライセンスの表示4.0国際と互換性があるとともに、利用者がOpen Data CommonsによるODC BY又はODbLでの利用を希望する場合に、それを妨げるものではありません。",
		disabled: false,
	},
	{
		key: "keywords",
		label: "キーワード",
		type: "textarea",
		placeholder: jp.common.typeSomething,
		value: "",
		disabled: false,
	},
	{
		key: "theme",
		label: "テーマ分類",
		type: "input",
		placeholder: jp.common.typeSomething,
		value: "",
		disabled: false,
	},
	{
		key: "spatial",
		label: "対象地域",
		type: "input",
		placeholder: "日本全国",
		value: "日本全国",
		disabled: false,
	},
	{
		key: "temporalResolution",
		label: "対象期間",
		type: "input",
		placeholder: jp.common.typeSomething,
		value: "",
		disabled: false,
	},
	{
		key: "publisher",
		label: "提供者",
		type: "input",
		placeholder: "国土交通省　総合政策局　情報政策課",
		value: "国土交通省　総合政策局　情報政策課",
		disabled: false,
	},
	{
		key: "contactPoint",
		label: "連絡先情報",
		type: "input",
		placeholder: jp.common.typeSomething,
		value: "",
		disabled: false,
	},
	{
		key: "creator",
		label: "作成者",
		type: "input",
		placeholder: "国土交通省　総合政策局　情報政策課",
		value: "国土交通省　総合政策局　情報政策課",
		disabled: false,
	},
	{
		key: "issued",
		label: "公開日",
		type: "input",
		placeholder: formatDate(
			new Date().toISOString(),
			DEFAULT_REGION,
			"yyyy-MM-dd",
		),
		value: formatDate(new Date().toISOString(), DEFAULT_REGION, "yyyy-MM-dd"),
		disabled: true,
	},
	{
		key: "modified",
		label: "最終更新日",
		type: "input",
		placeholder: formatDate(
			new Date().toISOString(),
			DEFAULT_REGION,
			"yyyy-MM-dd",
		),
		value: formatDate(new Date().toISOString(), DEFAULT_REGION, "yyyy-MM-dd"),
		disabled: true,
	},
	{
		key: "accrualPeriodicity",
		label: "更新頻度",
		type: "input",
		placeholder: "不定期",
		value: "不定期",
		disabled: false,
	},
	{
		key: "language",
		label: "言語",
		type: "input",
		placeholder: "ja",
		value: "ja",
		disabled: false,
	},
	{
		key: "publicScope",
		label: "公開範囲",
		type: "input",
		placeholder: "制限付き公開",
		value: "制限付き公開",
		disabled: false,
	},
	{
		key: "publicCondition",
		label: "公開条件",
		type: "input",
		placeholder: "ハッカソン参加者に限る",
		value: "ハッカソン参加者に限る",
		disabled: false,
	},
	{
		key: "license",
		label: "ライセンス",
		type: "input",
		placeholder: "政府標準利用規約（第2.0版）",
		value: "政府標準利用規約（第2.0版）",
		disabled: false,
	},
	{
		key: "rights",
		label: "利用規約",
		type: "input",
		placeholder: "https://www.mlit.go.jp/links/terms-of-use.html",
		value: "https://www.mlit.go.jp/links/terms-of-use.html",
		disabled: false,
	},
	{
		key: "version",
		label: "バージョン",
		type: "input",
		placeholder: "ver1.0",
		value: "ver1.0",
		disabled: false,
	},
	{
		key: "type",
		label: "タイプ",
		type: "input",
		placeholder: "csv",
		value: "csv",
		disabled: true,
	},
	{
		key: "encoding",
		label: "エンコーディング",
		type: "input",
		placeholder: "UTF-8",
		value: "UTF-8",
		disabled: true,
	},
	{
		key: "qualityAssessment",
		label: "品質評価",
		type: "textarea",
		placeholder: "正確性、完全性、一貫性",
		value: "正確性、完全性、一貫性",
		disabled: false,
	},
	{
		key: "dataQuality",
		label: "データ品質（品質測定結果）",
		type: "textarea",
		placeholder:
			"統計的な分析を行うのに十分な品質。ただし、データ型の統一などデータクレンジング処理を行っておりますが、紙資料の保存状態や記入状況によっては、正確な記載となっていない場合がございます。",
		value:
			"統計的な分析を行うのに十分な品質。ただし、データ型の統一などデータクレンジング処理を行っておりますが、紙資料の保存状態や記入状況によっては、正確な記載となっていない場合がございます。",
		disabled: false,
	},
	{
		key: "constraint",
		label: "制約",
		type: "input",
		placeholder: "利用規約による",
		value: "利用規約による",
		disabled: false,
	},
	{
		key: "costType",
		label: "有償無償区分*",
		type: "input",
		placeholder: "無償",
		value: "無償",
		disabled: false,
	},
	{
		key: "disasterCategory",
		label: "災害時区分*",
		type: "input",
		placeholder: "無償提供",
		value: "無償提供",
		disabled: false,
	},
	{
		key: "priceInfo",
		label: "価格情報",
		type: "input",
		placeholder: "無償",
		value: "無償",
		disabled: false,
	},
	{
		key: "usagePermission",
		label: "使用許諾",
		type: "textarea",
		placeholder:
			"Project LINKSの利用規約に従って、どなたでも、複製、公衆送信、翻訳・変形等の翻案等、自由に利用できます。商用利用も可能です。（https://www.mlit.go.jp/links/terms-of-use.html）",
		value:
			"Project LINKSの利用規約に従って、どなたでも、複製、公衆送信、翻訳・変形等の翻案等、自由に利用できます。商用利用も可能です。（https://www.mlit.go.jp/links/terms-of-use.html）",
		disabled: false,
	},
	{
		key: "conformsTo",
		label: "準拠する標準",
		type: "input",
		placeholder: "https://www.w3.org/TR/vocab-dcat-3/",
		value: "https://www.w3.org/TR/vocab-dcat-3/",
		disabled: false,
	},
	{
		key: "isReferencedBy",
		label: "関連ドキュメント",
		type: "input",
		placeholder: "https://www.mlit.go.jp/links/",
		value: "https://www.mlit.go.jp/links/",
		disabled: false,
	},
];

function generateProjectId() {
	const idNumber = Math.floor(10000 + Math.random() * 90000);
	const year = new Date().getFullYear();
	return `ProjectLinks${idNumber}_${year}`;
}
