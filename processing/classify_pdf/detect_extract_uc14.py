import argparse
from logging import getLogger
import numpy as np
import os
from pathlib import Path

from azure.ai.formrecognizer import DocumentAnalysisClient, AnalyzeResult
from azure.core.credentials import AzureKeyCredential
from dotenv import load_dotenv
from pypdf import PdfReader, PdfWriter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import torch
from transformers import BertModel, BertJapaneseTokenizer

logger = getLogger(__name__)

PDF_EXT = ".pdf"
# キーワードのリスト
KEYWORDS = ["安全管理規程", "一般旅客定期航路事業", "使用船舶明細"]
COLUMNS = ["使用船舶", "氏名", "企業名", "港名", "距離", "事業者所在地", "船名", "船舶の種類",
    "船質", "航行区域", "船舶保有者", "用途", "総トン数", "定員", "主機の種類",
    "連続最大出力", "最高速力", "航海速力", "全長", "幅", "最大高",
    "最大（満載）喫水", "造船所", "無線設備", "運動性能", "旋回径", "惰力",
    "操船上の特殊設備", "バリフリ対応状況"]
# 辞書のキー
DETECTION_KEY = "uc14_detection"
DETECTED_KEYWORDS_KEY = "detected_keywords"

# 検索スコア計算の係数
VECTOR_KEY = "vector"
TFIDF_KEY = "tfidf"
COUNT_KEY = "count"
WEIGHTS = {
    VECTOR_KEY: 0.6,
    TFIDF_KEY: 0.4,
    COUNT_KEY: 0.1
}

# ベクトル検索用 BERT モデル
BERT_MODEL_NAME = "cl-tohoku/bert-base-japanese"
# Azure 文書読み取りモード
AZURE_MODE = "prebuilt-layout"

# 環境変数の読み込み
load_dotenv()
OCR_ENDPOINT = os.getenv("DOCUMENT_INTELLIGENCE_ENDPOINT")
OCR_API_KEY = os.getenv("DOCUMENT_INTELLIGENCE_KEY")

# 環境変数のチェック
if not OCR_ENDPOINT or not OCR_API_KEY:
    raise ValueError("DOCUMENT_INTELLIGENCE_ENDPOINT または DOCUMENT_INTELLIGENCE_KEY が環境変数に設定されていません。")


def ocr_pdf(input_pdf: str) -> AnalyzeResult:
    """
    Azure OCR を使って PDF を読み取る
    """
    pdf_path = Path(input_pdf)
    if pdf_path.suffix != PDF_EXT:
        logger.error("The input file is not a PDF")
        raise ValueError("The input file is not a PDF")
    logger.info(f"Processing file: {pdf_path.name}")

    # クライアントの作成
    client = DocumentAnalysisClient(endpoint=OCR_ENDPOINT, credential=AzureKeyCredential(OCR_API_KEY))

    # PDFのOCR処理
    logger.info("OCR start")
    try:
        with open(pdf_path, "rb") as pdf_file:
            poller = client.begin_analyze_document(AZURE_MODE, document=pdf_file)
            result = poller.result()
    except Exception as e:
        logger.error(f"エラーが発生しました: {e}")
        raise Exception("Document Analysis failed")
    return result


def detect_usecase(result: AnalyzeResult):
    """
    Azure OCR により抽出されたテキストかに対し、特定のキーワードの部分一致検索
    該当の有無および検出されたキーワードの配列を辞書で返す
    """
    logger.debug(f"キーワード一覧:{', '.join(KEYWORDS)}")
    # 抽出したテキスト
    full_text: str = result.content
    logger.debug(full_text)

    # 検出されたキーワードを保存するリスト
    detected_keywords = [keyword for keyword in KEYWORDS if keyword in full_text]

    # 検出結果を表示
    if detected_keywords:
        logger.info(f"UC14 (検出されたキーワード: {', '.join(detected_keywords)})")
        result_d = {DETECTION_KEY: True, DETECTED_KEYWORDS_KEY: detected_keywords}
    else:
        logger.info("NOT UC14")
        result_d = {DETECTION_KEY: False, DETECTED_KEYWORDS_KEY: detected_keywords}
    return result_d


def rank_pages_by_keywords(pages: list[str], keywords: list[str], n=30) -> list[int]:
    """
    各ページ内容の文字列からなるリスト、および検索用キーワードからなるリストを入力とし、
    関連度の高いページの番号 （1 はじまり）を整数のリストとして返す。デフォルトでは上位 30 ページである。
    検索方式として BERT によるベクトル検索、tf-idf スコアをつけた部分一致検索、出現回数をスコアとする部分一致検索を用いる。
    """
    scores: dict[str, np.ndarray] = {}
    # BERT ベクトル検索
    logger.info("ベクトル検索開始")
    tokenizer = BertJapaneseTokenizer.from_pretrained(BERT_MODEL_NAME)
    model = BertModel.from_pretrained(BERT_MODEL_NAME)
    
    def get_bert_embedding(text):
        tokens = tokenizer(text, return_tensors="pt", padding=True, truncation=True)
        with torch.no_grad():
            output = model(**tokens)
        return output.last_hidden_state.mean(dim=1)
    
    keyword_text = " ".join(keywords)
    keyword_embedding = get_bert_embedding(keyword_text)
    page_embeddings = [get_bert_embedding(page) for page in pages]
    scores[VECTOR_KEY] = np.array([
        cosine_similarity(keyword_embedding, page_embedding)[0][0]
        for page_embedding in page_embeddings
    ])
    
    # tf-idf スコア
    logger.info("キーワード検索開始")
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(pages)
    query_vector = vectorizer.transform([" ".join(keywords)])
    scores[TFIDF_KEY] = cosine_similarity(query_vector, tfidf_matrix).flatten()
    
    # 出現回数
    def count_keywords(page_text):
        return sum(page_text.count(keyword) for keyword in keywords)

    scores[COUNT_KEY] = np.array([count_keywords(page) for page in pages])
    
    # 重みつき和
    combined_scores = sum(WEIGHTS[key] * scores[key] for key in scores)
    sorted_indices = np.argsort(combined_scores)[::-1]
    selected_page_numbers = [int(i + 1) for i in sorted_indices[:n]]
    logger.info(f"抜き出されたページ一覧 (関連度順):{selected_page_numbers}")
    
    return selected_page_numbers


def extract_selected_pages(pdf_path, output_path, page_numbers: list[int]):
    reader = PdfReader(pdf_path)
    writer = PdfWriter()
    for i in page_numbers:
        writer.add_page(reader.pages[i - 1])
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    writer.write(output_path)
    logger.info(f"{output_path} に保存しました。")


def analyze_pdf(input_pdf, output_pdf):
    ocr_result = ocr_pdf(input_pdf)
    detection_d = detect_usecase(ocr_result)

    if detection_d[DETECTION_KEY]:
        # ページごとの内容を文字列化
        pages: list[str] = []
        for page in ocr_result.pages:
            page_text = "".join([word.content for word in page.words])
            pages.append(page_text)
            logger.debug(f"\n\n=== Page {page.page_number} ===\n{page_text}\n")
        logger.debug(f"列名一覧:{', '.join(COLUMNS)}")
        # BERTとTF-IDFで列名と各ページとの関連度を計算
        page_numbers = rank_pages_by_keywords(pages, COLUMNS)
        # 指定ページを PDF から抽出し新しい PDF を作成
        extract_selected_pages(input_pdf, output_pdf, page_numbers)


def main():
    # # コマンドライン引数
    # parser = argparse.ArgumentParser(description="Azure OCR を使って PDF を解析し、特定のキーワードを検出するスクリプト")
    # parser.add_argument("--input_pdf", type=str, required=True, help="OCR を実行する PDF ファイルのパス")
    # parser.add_argument("--output_pdf", type=str, required=True, help="結果出力 PDF ファイルのパス")
    # args = parser.parse_args()
    input = "uc14/第一マリン（許可申請書沖縄第48号）.pdf"
    output = "output/第一マリン（許可申請書沖縄第48号）.pdf"
    # 指定された PDF ファイルを解析
    analyze_pdf(input, output)


if __name__ == "__main__":
    # ロガーの設定
    import logging
    logging.basicConfig(level=logging.WARNING)
    logger.setLevel(level=logging.INFO)
    main()
