from collections import defaultdict

def find_common_substrings(
    texts: list[str],
    min_length: int = 3,
):
    substrings = defaultdict(int)
    for text in texts:
        for i in range(len(text)):
            for j in range(i + min_length, len(text) + 1):
                substrings[text[i:j]] += 1
    return substrings


def find_most_common_substrings(
    texts: list[str],
    min_length: int = 3,
):
    substrings = find_common_substrings(texts, min_length)
    if len(substrings) == 0:
        return None
    return max(substrings, key=lambda k: (substrings[k], len(k)))


def cluster_texts(
    texts: list[str],
    min_length: int = 3,
):
    most_common_substring = find_most_common_substrings(texts, min_length)
    # クラスタリング
    clusters = []
    for text in texts:
        if most_common_substring is None or most_common_substring in text:
            clusters.append(1)  # 最も頻出する部分文字列を含む
        else:
            clusters.append(0)  # その他

    return clusters
