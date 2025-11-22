# src/checker/multi_lang_checker.py
import json
from typing import List, Dict, Set
from pypinyin import pinyin, Style
import nagisa

class MultiLangSpellChecker:
    """统一的多语言拼写检查器（Python 实现）"""
    
    def __init__(self):
        self.zh_dict: Set[str] = self._load_dict("dict/zh_tech.json")
        self.ja_dict: Set[str] = self._load_dict("dict/ja_tech.json")
        self.ja_tagger = nagisa.Tagger()  # 一旦初始化，终身复用

    def _load_dict(self, path: str) -> Set[str]:
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return set(json.load(f))
        except FileNotFoundError:
            print(f"[警告] 词库未找到: {path}，使用空词典")
            return set()

    def _to_pinyin(self, chinese: str) -> str:
        """将中文转为无声调拼音（小写）"""
        return ''.join([p[0] for p in pinyin(chinese, style=Style.NORMAL)]).lower()

    def _is_valid_chinese(self, word: str) -> bool:
        """拼音输入匹配中文词典（核心防误报逻辑）"""
        pinyin_input = word.lower()
        return any(self._to_pinyin(zh_word) == pinyin_input for zh_word in self.zh_dict)

    def _is_valid_japanese(self, text: str) -> bool:
        """日文分词后检查是否命中词典"""
        tokens = self.ja_tagger.tagging(text).words
        return any(token in self.ja_dict for token in tokens)

    def check(self, text: str, locale: str = "en") -> List[Dict]:
        """
        主检查函数
        返回：[{ "text": "错误词", "suggestions": [...] }, ...]
        """
        words = text.split()
        issues = []

        for word in words:
            clean = word.strip(".,!?;:'\"()[]{}").lower()

            if not clean:
                continue

            # 中文拼音检查（核心）
            if locale in ["zh", "zh-CN"] and self._is_valid_chinese(clean):
                continue

            # 日文分词检查
            if locale in ["ja", "ja-JP"] and self._is_valid_japanese(clean):
                continue

            # 可选：结合 pyspellchecker 做英文检查（这里简化）
            if clean not in {"python", "numpy", "pandas"}:  # 示例白名单
                issues.append({
                    "text": word,
                    "suggestions": self._generate_suggestions(clean, locale)
                })

        return issues

    def _generate_suggestions(self, word: str, locale: str) -> List[str]:
        """生成候选建议（限制 ≤5 个）"""
        if locale in ["zh", "zh-CN"]:
            matches = [zh for zh in self.zh_dict if self._to_pinyin(zh).startswith(word[:4])]
            return matches[:5]
        return [f"[{word}?]"]  # 占位建议