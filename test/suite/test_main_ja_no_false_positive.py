from backend.main import check

def test_no_false_positive_for_known_katakana():
    res = check("モデル モデル")
    words = [e["word"] for e in res["errors"]]
    assert "モデル" not in words
