from backend.algorithm.japaneseTokenizer import check

def test_japanese_known_and_unknown():
    res = check("モデルとモデる")
    assert "tokens" in res
    assert isinstance(res["errors"], list)
    res2 = check("モデる")
    suggs = [s["replacement"] for s in res2["suggestions"]]
    assert any("モデル" == x for x in suggs)
