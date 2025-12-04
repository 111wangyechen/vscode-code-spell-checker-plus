import sys
import json
import codecs
try:
    from backend.dictionary import Dictionary
    from backend.algorithm.suggestion import suggest_for
    from backend.algorithm.pinyinChecker import check as check_pinyin
    from backend.algorithm.japaneseTokenizer import check as check_japanese
    from backend.algorithm.zhChecker import check as check_zh
except Exception:
    from dictionary import Dictionary
    from algorithm.suggestion import suggest_for
    from algorithm.pinyinChecker import check as check_pinyin
    from algorithm.japaneseTokenizer import check as check_japanese
    from algorithm.zhChecker import check as check_zh

# 强制 stdin/stdout 使用 UTF-8，避免在某些系统上出现编码错乱
if not isinstance(sys.stdin, codecs.StreamReader):
    sys.stdin = codecs.getreader("utf-8")(sys.stdin.buffer)
if not isinstance(sys.stdout, codecs.StreamWriter):
    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.buffer)

dict_obj = Dictionary()
DEFAULT_LANGS = ["en", "zh", "ja"]

def tokens(text):
    r = []
    i = 0
    w = ""
    for ch in text:
        if ch.isascii() and (ch.isalnum() or ch == "_"):
            w += ch
        else:
            if w:
                r.append((i - len(w), i, w))
                w = ""
        i += 1
    if w:
        r.append((i - len(w), i, w))
    return r

def check(text, languages=None):
    langs = set(languages or DEFAULT_LANGS)
    errors = []
    suggestions = []
    seen = set()
    ja_tokens = []
    zh_tokens = []
    if "en" in langs:
        for s, e, w in tokens(text):
            if not dict_obj.is_known(w):
                key = (s, e, w)
                if key not in seen:
                    seen.add(key)
                    errors.append({"start": s, "end": e, "word": w})
                    for sug in suggest_for(w, dict_obj):
                        suggestions.append({"original": w, "replacement": sug[0], "score": sug[1]})
    if "zh" in langs:
        p = check_pinyin(text)
        for err in p.get("errors", []):
            # 如果该词在英文词典中是已知词（如 "the" 等），则不当作拼音错误
            if dict_obj.is_known(err["word"]):
                continue
            key = (err["start"], err["end"], err["word"])
            if key not in seen:
                seen.add(key)
                errors.append(err)
        for s in p.get("suggestions", []):
            suggestions.append(s)
        z = check_zh(text)
        zh_tokens = z.get("tokens", [])
        for err in z.get("errors", []):
            key = (err["start"], err["end"], err["word"])
            if key not in seen:
                seen.add(key)
                errors.append(err)
        for s in z.get("suggestions", []):
            suggestions.append(s)
    if "ja" in langs:
        j = check_japanese(text)
        ja_tokens = j.get("tokens", [])
        for err in j.get("errors", []):
            key = (err["start"], err["end"], err["word"])
            if key not in seen:
                seen.add(key)
                errors.append(err)
        for s in j.get("suggestions", []):
            suggestions.append(s)
    return {"errors": errors, "suggestions": suggestions, "ja_tokens": ja_tokens, "zh_tokens": zh_tokens}

def handle(req):
    a = req.get("action")
    if a == "ping":
        return {"ok": True}
    if a == "check":
        return check(req.get("text", ""), req.get("languages"))
    if a == "suggest":
        w = req.get("word", "")
        res = [{"original": w, "replacement": s[0], "score": s[1]} for s in suggest_for(w, dict_obj)]
        return {"suggestions": res}
    return {"ok": False}

def main():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        msg = json.loads(line)
        res = handle(msg)
        sys.stdout.write(json.dumps({"id": msg.get("id"), "result": res}) + "\n")
        sys.stdout.flush()

if __name__ == "__main__":
    main()
