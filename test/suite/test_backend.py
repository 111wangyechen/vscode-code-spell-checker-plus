import json
from backend.dictionary import Dictionary
from backend.algorithm.suggestion import suggest_for
from backend.main import check

def test_dictionary_loads():
    d = Dictionary()
    assert len(d.all_terms()) > 0

def test_suggest_for_word():
    d = Dictionary()
    res = suggest_for("modle", d)
    assert isinstance(res, list)

def test_backend_check_integrates_pinyin():
    res = check("shii")
    assert "errors" in res
    assert "suggestions" in res
