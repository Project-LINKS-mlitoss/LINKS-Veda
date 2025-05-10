import numpy as np
import pandas as pd
from scipy.stats import zscore
import re
import datetime

def detect_outliers(df, column, method='iqr', threshold=1.5):
    """
    Detect outliers in a specified column of a DataFrame using the specified method.

    Parameters:
        df (pd.DataFrame): The input DataFrame.
        column (str): The column to analyze for outliers.
        method (str): The method to use for detecting outliers ('iqr' or 'zscore').
        threshold (float): The threshold for detecting outliers.
            - For 'iqr', this is the multiplier for the IQR (default 1.5).
            - For 'zscore', this is the z-score value (default 1.5).

    Returns:
        dict: A dictionary with 'outliers' (list of outlier indices) and 'non_outliers' (list of non-outlier indices).
    """
    if column not in df.columns:
        raise ValueError(f"Column '{column}' does not exist in the DataFrame.")

    if not pd.api.types.is_numeric_dtype(df[column]):
        raise ValueError(f"Column '{column}' is not numeric.")

    data = df[column].dropna().values  # Drop NaN values and get numeric data

    if method == 'iqr':
        q1 = np.percentile(data, 25)
        q3 = np.percentile(data, 75)
        iqr = q3 - q1
        lower_bound = q1 - threshold * iqr
        upper_bound = q3 + threshold * iqr
        outliers = np.where((data < lower_bound) | (data > upper_bound))[0]

    elif method == 'zscore':
        z_scores = np.abs(zscore(data))
        outliers = np.where(z_scores > threshold)[0]

    else:
        raise ValueError("Method must be either 'iqr' or 'zscore'.")

    non_outliers = np.setdiff1d(np.arange(len(data)), outliers)

    # Map back to original DataFrame indices
    original_indices = df[column].dropna().index
    outlier_indices = original_indices[outliers].tolist()
    non_outlier_indices = original_indices[non_outliers].tolist()

    return {
        'outliers': outlier_indices,
        'non_outliers': non_outlier_indices
    }

def convert_date_to_gregorian(date_text, output_format="%Y-%m-%d"):
    # 和暦の「令和」「平成」「昭和」などを西暦に変換
    era_mapping = {
        "令和": 2018,  # 令和1年は2019年
        "平成": 1988,  # 平成1年は1989年
        "昭和": 1925,  # 昭和1年は1926年
        "大正": 1911,  # 大正1年は1912年
        "明治": 1867   # 明治1年は1868年
    }

    # 日付と時刻の正規表現パターン
    patterns = [
        r"(\d{4})年(\d{1,2})月(\d{1,2})日(?:.*?(\d{1,2})時(\d{1,2})分)?",  # 西暦形式
        r"(令和|平成|昭和|大正|明治)(\d+)年(\d{1,2})月(\d{1,2})日(?:.*?(\d{1,2})時(\d{1,2})分)?",  # 和暦形式
        r"(R|H|S|T|M)(\d+)年(\d{1,2})月(\d{1,2})日(?:.*?(\d{1,2})時(\d{1,2})分)?"   # 略記和暦形式
    ]
    if date_text is None:
        return None
    for pattern in patterns:
        match = re.search(pattern, date_text)
        if match:
            groups = match.groups()
            if len(groups) >= 4:
                if groups[0] in era_mapping:  # 和暦形式
                    era, year, month, day = groups[:4]
                    year = era_mapping[era] + int(year)
                elif groups[0] in "RHS":  # 略記和暦
                    era, year, month, day = groups[:4]
                    era_mapping_short = {"R": 2018, "H": 1988, "S": 1925}
                    year = era_mapping_short[era] + int(year)
                else:  # 西暦形式
                    year, month, day = groups[:3]

                # 時刻を抽出（デフォルトは 00:00:00）
                try:
                    hour = int(groups[4]) if len(groups) > 4 and groups[4] else 0
                    minute = int(groups[5]) if len(groups) > 5 and groups[5] else 0
                    if not (0 <= hour < 24) or not (0 <= minute < 60):
                        raise ValueError
                except ValueError:
                    hour, minute = 0, 0  # 不正な時刻は 00:00:00 に設定

                # 日時オブジェクトに変換
                dt = datetime.datetime(int(year), int(month), int(day), hour, minute)
                return dt.strftime(output_format)

    # 日付が解析できない場合
    return None

def convert_to_year(value):
    try:
        if pd.isna(value) or value in ["特に記載なし", "未入力", "不明", "null", "記載なし", "データなし"]:
            return None
        value = str(value).strip()

        # 和暦の変換
        if re.match(r"令和(\d+)年?", value):  # 令和
            year = int(re.search(r"令和(\d+)", value).group(1))
            return 2018 + year
        elif re.match(r"平成(\d+)年?", value):  # 平成
            year = int(re.search(r"平成(\d+)", value).group(1))
            return 1988 + year
        elif re.match(r"昭和(\d+)年?", value):  # 昭和
            year = int(re.search(r"昭和(\d+)", value).group(1))
            return 1925 + year

        # 西暦の変換
        if re.match(r"\d{4}年", value):  # 西暦が含まれる場合
            return int(re.search(r"(\d{4})年", value).group(1))

        # 数字のみの場合（5年など）
        if re.match(r"^\d+年", value):
            year = int(re.search(r"^(\d+)年", value).group(1))
            return year

        # 不明な形式は None
        return None
    except Exception:
        return None
