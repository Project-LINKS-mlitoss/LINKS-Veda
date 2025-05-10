import pandas as pd
from datetime import datetime
import requests
from rdflib import Graph, URIRef, Literal, RDF
from rdflib.namespace import DCAT, DC, FOAF, XSD, DCTERMS
import magic
import mimetypes
import tempfile
import os

# JWT Token For Download File
CMS_GET_ASSETS_TOKEN = os.getenv('CMS_GET_ASSETS_TOKEN', None)

def handle_create_rdf(file_path):
    try:
        sheet_name = "01_データ構成（メタデータ）"
        category_col_name = "カテゴリ（クラス）"
        data_array_xlsx = data_dict(file_path, sheet_name, category_col_name)
        g = Graph()
        g.bind('dcat', DCAT)
        g.bind('dc', DC)
        g.bind('foaf', FOAF)
        g.bind('xsd', XSD)
        g.bind('dct', DCTERMS)

        for item in data_array_xlsx:
            if "管理ID（URL）" in item:
                catalog_uri = URIRef(item["管理ID（URL）"])
                ctg_uri = category_uri(item["category"])
                match ctg_uri:
                    case "Catalog":
                        handle_catalog(g, item, catalog_uri, ctg_uri)
                    case "Dataset":
                        handle_dataset(g, item, catalog_uri, ctg_uri)
                    case "Dataservice":
                        handle_dataservice(g, item, catalog_uri, ctg_uri)
                    case "Distribution":
                        handle_distribution(g, item, catalog_uri, ctg_uri)
        data = g.serialize(format="ttl", encoding="utf-8")
        return data.decode("utf-8")
    except BaseException as e:
        print(e)

def handle_catalog(g, item, catalog_uri, category_uri):
    g.add((catalog_uri, RDF.type, DCAT[category_uri]))
    g.add((catalog_uri, DC['identifier'], catalog_uri))
    g.add((catalog_uri, DC['title'], Literal(item.get("タイトル（データセット名称）"))))
    g.add((catalog_uri, DC['description'], Literal(item.get("説明"), datatype=XSD.string)))
    g.add((catalog_uri, DCAT['keyword'], Literal(item.get("キーワード"))))
    g.add((catalog_uri, DCAT['theme'], Literal(item.get("テーマ分類"))))
    g.add((catalog_uri, DCTERMS['spatial'], Literal(item.get("対象地域"))))
    g.add((catalog_uri, DCAT['temporalResolution'], Literal(item.get("対象期間"))))
    g.add((catalog_uri, DC['publisher'], Literal(item.get("提供者"))))
    g.add((catalog_uri, DCAT['contactPoint'], Literal(URIRef(item.get("連絡先情報")))))
    g.add((catalog_uri, DC['creator'], Literal(item.get("作成者"))))
    g.add((catalog_uri, DCTERMS['issued'],
           Literal(convert_date_format(item.get("公開日")), datatype=XSD.dateTime)))
    g.add((catalog_uri, DCTERMS['modified'],
           Literal(convert_date_format(item.get("最終更新日")), datatype=XSD.dateTime)))
    g.add((catalog_uri, DCTERMS['accrualPeriodicity'], Literal(item.get("更新頻度"))))
    g.add((catalog_uri, DC['language'], Literal("ja")))
    g.add((catalog_uri, DCTERMS['license'], Literal(item.get("ライセンス"))))
    g.add((catalog_uri, DC['rights'], URIRef(item.get("利用規約"))))
    g.add((catalog_uri, FOAF['homepage'], URIRef(item.get("ホームページ（ソース）"))))

def handle_dataset(g, item, catalog_uri, category_uri):
    g.add((catalog_uri, RDF.type, DCAT[category_uri]))
    g.add((catalog_uri, DC['identifier'], catalog_uri))
    g.add((catalog_uri, DC['title'], Literal(item.get("タイトル"))))
    g.add((catalog_uri, DCTERMS['hasVersion'], Literal(item.get("バージョン"))))
    g.add((catalog_uri, DC['description'], Literal(item.get("説明"), datatype=XSD.string)))
    g.add((catalog_uri, DCAT['keyword'], Literal(item.get("キーワード"))))
    g.add((catalog_uri, DCTERMS['spatial'], Literal(item.get("対象地域(範囲)"))))
    g.add((catalog_uri, DCAT['temporalResolution'], Literal(item.get("対象期間"))))
    g.add((catalog_uri, DCAT['theme'], Literal(item.get("分類"))))
    g.add((catalog_uri, DC['publisher'], Literal(item.get("提供者"))))
    g.add((catalog_uri, DC['creator'], Literal(item.get("作成者"))))
    g.add((catalog_uri, DCAT['contactPoint'], Literal(URIRef(item.get("連絡先情報")))))
    g.add((catalog_uri, DC["type"], Literal(item.get("タイプ"))))
    g.add((catalog_uri, DCTERMS["issued"],
           Literal(convert_date_format(item.get("公開日")), datatype=XSD.dateTime)))
    g.add((catalog_uri, DCTERMS['modified'],
           Literal(convert_date_format(item.get("最終更新日")), datatype=XSD.dateTime)))
    g.add((catalog_uri, DCTERMS['accrualPeriodicity'], Literal(item.get("更新頻度"))))
    g.add((catalog_uri, DC['language'], Literal(item.get("言語"))))
    g.add((catalog_uri, DCTERMS['license'], Literal(item.get("ライセンス"))))
    g.add((catalog_uri, DCTERMS['conformsTo'], URIRef(item.get("準拠する標準"))))
    g.add((catalog_uri, DCTERMS['isReferencedBy'], URIRef(item.get("関連ドキュメント"))))
    g.add((catalog_uri, DCAT['landingPage'], URIRef(item.get("ランディングページ"))))

def handle_dataservice(g, item, catalog_uri, category_uri):
    g.add((catalog_uri, RDF.type, DCAT[category_uri]))
    g.add((catalog_uri, DC['identifier'], catalog_uri))
    g.add((catalog_uri, DC['title'], Literal(item.get("タイトル"))))
    g.add((catalog_uri, DC['description'], Literal(item.get("説明"))))
    g.add((catalog_uri, DCAT['keyword'], Literal(item.get("キーワード"))))
    g.add((catalog_uri, DC['publisher'], Literal(item.get("提供者"))))
    g.add((catalog_uri, DC["type"], Literal(item.get("タイプ"))))
    g.add((catalog_uri, DCTERMS['license'], Literal(item.get("ライセンス"))))
    g.add((catalog_uri, DCTERMS['conformsTo'], Literal(item.get("準拠する標準"))))
    g.add((catalog_uri, DCTERMS['isReferencedBy'], URIRef(item.get("関連ドキュメント"))))
    g.add((catalog_uri, DCAT['endpointURL'], URIRef(item.get("エンドポイントURL"))))
    g.add((catalog_uri, DCAT['landingPage'], URIRef(item.get("ランディングページ"))))

def handle_distribution(g, item, catalog_uri, category_uri):
    g.add((catalog_uri, RDF.type, DCAT[category_uri]))
    g.add((catalog_uri, DC['identifier'], catalog_uri))
    g.add((catalog_uri, DC['title'], Literal(item.get("タイトル（ファイル名）"))))
    g.add((catalog_uri, DC['description'], Literal(item.get("説明"))))
    g.add((catalog_uri, DCAT['accessService'], Literal(item.get("アクセスサービス"))))
    g.add((catalog_uri, DCAT['byteSize'], Literal(item.get("バイトサイズ"))))
    g.add((catalog_uri, DC["format"], Literal(item.get("ファイル形式"))))
    g.add((catalog_uri, DCAT["mediaType"], Literal(item.get("メディアタイプ"))))
    if item.get("公開日") != None:
        g.add((catalog_uri, DCTERMS['issued'],
               Literal(convert_date_format(item.get("公開日")), datatype=XSD.dateTime)))
    if item.get("最終更新日") != None:
        g.add((catalog_uri, DCTERMS['modified'],
               Literal(convert_date_format(item.get("最終更新日")), datatype=XSD.dateTime)))
    g.add((catalog_uri, DCAT['temporalResolution'], Literal(item.get("期間"))))
    g.add((catalog_uri, DCTERMS["accessRights"], Literal(item.get("ステータス"))))
    g.add((catalog_uri, DC['language'], Literal(item.get("言語"))))
    g.add((catalog_uri, DCTERMS['license'], Literal(item.get("ライセンス"))))
    if item.get("利用規約") != None:
        g.add((catalog_uri, DC['rights'], URIRef(item.get("利用規約"))))
    g.add((catalog_uri, DCTERMS['conformsTo'], URIRef(item.get("準拠する標準"))))
    g.add((catalog_uri, DCTERMS['isReferencedBy'], URIRef(item.get("関連ドキュメント"))))
    g.add((catalog_uri, DCAT['accessURL'], Literal(item.get("アクセスURL"))))
    g.add((catalog_uri, DCAT['downloadURL'], Literal(item.get("ダウンロードURL"))))

def convert_date_format(date_str: str):
    date_obj = datetime.strptime(date_str, '%Y-%m-%d')
    return date_obj.strftime('%Y-%m-%dT%H:%M:%SZ')

def category_uri(category: str) -> str:
    if category == "カタログ情報":
        return "Catalog"
    elif category == "データセット情報":
        return "Dataset"
    elif category == "データサービス情報":
        return "Dataservice"
    elif "配信情報" in category:
        return "Distribution"
    else:
        return "Unknown"

def data_dict(file_path: str,sheet_name: str,category_col_name:str) -> list:
    empty_rows = get_empty_row(file_path, sheet_name)
    data = pd.read_excel(file_path, sheet_name, skiprows=empty_rows, header=0)
    if (category_col_name not in data.columns):
        data.columns = ['カテゴリ（クラス）', 'Unnamed: 1', 'メタデータ項目', 'メタデータ内容']
        data.drop(data.index[0], inplace=True)
        data.reset_index(drop=True, inplace=True)
    data[category_col_name] = data[category_col_name].ffill()
    category_list = []
    for category, group in data.groupby(category_col_name):
        category_dict = {"category": str(category).replace('\n', '')}
        for _, row in group.iterrows():
            category_dict[row["メタデータ項目"]] = row["メタデータ内容"]
        category_list.append(category_dict)
    return category_list

def get_empty_row(file_path: str, sheet_name: str) -> int:
    empty_rows_start = 0
    df = pd.read_excel(file_path, sheet_name)
    for index, row in df.iterrows():
        if row.isnull().all():
            empty_rows_start += 1
        else:
            break
    return empty_rows_start


def get_extension_file(url):
    try:
        ext_file = get_extention_file_from_url(url)
        output_file_path = download_file(url)

        if ext_file["status"]:
            return output_file_path, ext_file["ext"]
        else:
            validator = magic.Magic(uncompress=True, mime=True)
            file_type = validator.from_file(output_file_path)
            extension = mimetypes.guess_extension(file_type, strict=True).replace('.', '')
            if extension and extension == 'xlsx':
                return output_file_path, extension
            return output_file_path, 'txt'
    except BaseException as e:
        print(e)
        return None, 'txt'

def download_file(url):
    # Download file
    headers = {
        'Authorization': f'Bearer {CMS_GET_ASSETS_TOKEN}'
    }

    if not CMS_GET_ASSETS_TOKEN:
        data = requests.get(url, stream=True)
    else:
        data = requests.get(url, headers=headers, stream=True)
    data.raise_for_status()
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        for chunk in data.iter_content(chunk_size=8192):
            if chunk:
                temp_file.write(chunk)

        output_file_path = temp_file.name

    return output_file_path

def get_extention_file_from_url(url):
    arr_file_url = url.split('/')
    file_name = arr_file_url[len(arr_file_url) - 1]
    arr_file_name = file_name.split('.')
    if len(arr_file_name) > 1:
        return {'status': True, 'ext': arr_file_name[len(arr_file_name) - 1]}
    else:
        return {'status': False, 'ext': ''}
    