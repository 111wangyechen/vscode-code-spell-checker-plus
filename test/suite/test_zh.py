from backend.algorithm.zhChecker import check

def test_zh_known_word_no_error():
    res = check("模型")
    assert len(res["errors"]) == 0

def test_zh_unknown_word_outputs_error():
    res = check("謀型")
    assert len(res["errors"]) >= 1
