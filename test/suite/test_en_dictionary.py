from backend.dictionary import Dictionary

def test_en_words_known():
    d = Dictionary()
    assert d.is_known("the")
    assert d.is_known("bug")
    assert d.is_known("function")
