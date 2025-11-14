# src/extension.py
# 扩展入口：实现 Code Action 注入等效功能，用于“一键修复”建议
# 适用于 VS Code Python 扩展或 CLI 工具，支持多语言建议生成

from typing import List, Dict, Any, Optional
from spellchecker import SpellChecker  # 基础拼写检查
from dict.multi_lang_dictionary import MultiLangDictionary
from spellcheck.pinyin_fuzzy_matcher import is_pinyin_match

class SpellCheckExtension:
    """
    Code Spell Checker 插件的 Python 扩展入口类。
    提供 provide_code_actions 函数，等效于 VS Code 的 CodeActionProvider。
    支持：
    - 基础拼写检查（pyspellchecker）
    - 中文拼音模糊匹配
    - 日文分词词典验证
    - 限制建议数量（≤5）
    """

    def __init__(self):
        self.spell = SpellChecker()  # 英文基础检查器
        self.multi_dict = MultiLangDictionary()
        self.multi_dict.init()  # 初始化中/日词库
        self.max_suggestions = 5  # 性能目标：建议 ≤5 个

    def _is_valid_in_multilang(self, word: str, locale: str) -> bool:
        """
        检查词是否在多语言词典中（中文拼音 / 日文分词）
        """
        if locale == 'zh':
            # 尝试拼音匹配：遍历中文词典查找匹配项
            for zh_word in self.multi_dict.zh_dict:
                if is_pinyin_match(word, zh_word):
                    return True
            return False
        elif locale == 'ja':
            return self.multi_dict.has(word, 'ja')
        return False

    def _generate_suggestions(self, word: str, locale: str) -> List[str]:
        """
        生成候选词建议（综合基础 + 多语言）
        """
        suggestions = set()

        # 1. 基础拼写建议（英文/通用）
        base_candidates = self.spell.candidates(word)
        if base_candidates:
            suggestions.update(list(base_candidates)[:self.max_suggestions])

        # 2. 多语言建议
        if locale == 'zh':
            # 查找拼音匹配的中文词
            matches = [zh_word for zh_word in self.multi_dict.zh_dict if is_pinyin_match(word, zh_word)]
            suggestions.update(matches[:self.max_suggestions])

        # 3. 限制总数
        return list(suggestions)[:self.max_suggestions]

    def provide_code_actions(
        self,
        text: str,
        locale: str = 'en',
        generate_suggestions: bool = True
    ) -> List[Dict[str, Any]]:
        """
        主入口函数：等效于 VS Code CodeActionProvider.provideCodeActions
        返回拼写问题和修复建议列表。

        Args:
            text: 输入文本（单行或整段）
            locale: 语言区域 ('en', 'zh', 'ja')
            generate_suggestions: 是否生成建议

        Returns:
            List[Issue] 每个 issue 包含 text 和 suggestions
        """
        words = text.split()
        issues: List[Dict[str, Any]] = []

        for word in words:
            # 跳过空词、数字、纯符号
            cleaned_word = word.strip('.,!?;:"\'').lower()
            if not cleaned_word or cleaned_word.isdigit():
                continue

            # 1. 检查是否在多语言词典中 → 合法，不误报
            if self._is_valid_in_multilang(cleaned_word, locale):
                continue

            # 2. 基础拼写检查
            if cleaned_word in self.spell:
                continue  # 英文正确

            # 3. 标记为误报
            issue: Dict[str, Any] = {"text": word}
            if generate_suggestions:
                suggestions = self._generate_suggestions(cleaned_word, locale)
                if suggestions:
                    issue["suggestions"] = suggestions
            issues.append(issue)

        return issues

    def apply_suggestion(self, original_text: str, issue: Dict[str, Any], suggestion: str) -> str:
        """
        应用修复建议（模拟“一键修复”）
        """
        return original_text.replace(issue["text"], suggestion, 1)


# ==================== 示例使用（可作为 CLI 或 VS Code 扩展入口） ====================

def main():
    ext = SpellCheckExtension()

    # 示例文本
    test_cases = [
        ("This is a custum term with zhongwen and Pythonで.", 'en'),
        ("zhongwen is not eror", 'zh'),
        ("pythnで簡単", 'ja'),
    ]

    for text, locale in test_cases:
        print(f"\n--- 检查文本: '{text}' (locale: {locale}) ---")
        issues = ext.provide_code_actions(text, locale=locale)
        for i, issue in enumerate(issues):
            print(f"误报 {i+1}: {issue['text']}")
            if 'suggestions' in issue:
                print(f"  建议: {issue['suggestions']}")
                # 模拟修复
                fixed = ext.apply_suggestion(text, issue, issue['suggestions'][0])
                print(f"  修复后: {fixed}")

if __name__ == "__main__":
    main()