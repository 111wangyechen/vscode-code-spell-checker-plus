# tests/test_multilang_checker.py
from src.checker.multi_lang_checker import MultiLangSpellChecker

def test_chinese_pinyin_not_reported():
    checker = MultiLangSpellChecker()
    issues = checker.check("zhongwen is very good", "zh")
    assert not any("zhongwen" in i["text"] for i in issues)

def test_japanese_not_reported():
    checker = MultiLangSpellChecker()
    issues = checker.check("Pythonで開発します", "ja")
    assert len(issues) == 0

def test_english_misspelling_reported():
    checker = MultiLangSpellChecker()
    issues = checker.check("This is a custum error", "en")
    assert any("custum" in i["text"] for i in issues)