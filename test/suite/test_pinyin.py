from backend.algorithm.pinyinChecker import check

def test_pinyin_errors_and_suggestions():
    res = check("shii zhongguo ren")
    assert len(res["errors"]) >= 1
    assert isinstance(res["suggestions"], list)
