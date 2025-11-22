# src/spellcheck/pinyin_fuzzy_matcher.py

from pypinyin import pinyin, Style
from typing import List

def _word_to_pinyin(word: str, style: Style = Style.NORMAL) -> str:
    """
    将单个汉字词或词组转换为拼音字符串（无空格、声调可选）。
    
    Args:
        word: 输入的汉字字符串
        style: 拼音风格，默认 Style.NORMAL（不带声调）

    Returns:
        拼音字符串（小写）
    """
    # pinyin() 返回 [[p1], [p2], ...] 结构，取第一个读音（主读音）
    pinyin_list: List[str] = [item[0] for item in pinyin(word, style=style, heteronym=False)]
    return ''.join(pinyin_list).lower()

def is_pinyin_match(input_str: str, target_word: str) -> bool:
    """
    判断输入的拼音字符串是否匹配目标汉字词（模糊匹配，降低误报）。
    
    主要用于拼写检查场景：
    - 用户输入 "zhongwen" → 应识别为 "中文"，不标记为拼写错误。
    - 支持多音字默认取主读音，忽略声调、大小写。

    Args:
        input_str: 用户输入的拼音或拼音化字符串（如 "zhongwen"）
        target_word: 词典中的正确汉字（如 "中文"）

    Returns:
        bool: 是否匹配
    """
    if not input_str or not target_word:
        return False

    # 转换为无空格、无声调的拼音
    input_pinyin = input_str.strip().lower()
    target_pinyin = _word_to_pinyin(target_word, style=Style.NORMAL)

    return input_pinyin == target_pinyin

# 增强版：支持声调匹配（可选）
def is_pinyin_match_with_tone(input_str: str, target_word: str) -> bool:
    """
    带声调的拼音匹配（更严格）。
    """
    input_pinyin = input_str.strip().lower()
    target_pinyin = _word_to_pinyin(target_word, style=Style.TONE2)  # 如 zhong1wen2
    return input_pinyin == target_pinyin

# 示例测试代码（可移除）
if __name__ == "__main__":
    test_cases = [
        ("zhongwen", "中文", True),
        ("zhongwen", "中文", True),
        ("zhong wen", "中文", False),  # 有空格不匹配
        ("ZhongWen", "中文", True),     # 忽略大小写
        ("python", "派森", False),
    ]

    print("无声调匹配测试:")
    for inp, word, expected in test_cases:
        result = is_pinyin_match(inp, word)
        print(f"is_pinyin_match('{inp}', '{word}') = {result} (期望: {expected})")

    print("\n带声调匹配测试:")
    print(is_pinyin_match_with_tone("zhong1wen2", "中文"))  # True
    print(is_pinyin_match_with_tone("zhongwen", "中文"))    # False（无声调）