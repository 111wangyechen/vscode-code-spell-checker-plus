def _syllables():
    import json, os
    p = os.path.join(os.path.dirname(__file__), "..", "data", "pinyin_syllables.json")
    with open(p, "r", encoding="utf-8") as f:
        arr = json.load(f)
    return set(arr)

def _tokens(text: str):
    res = []
    i = 0
    w = ""
    for ch in text:
        if "a" <= ch <= "z":
            w += ch
        else:
            if w:
                res.append((i - len(w), i, w))
                w = ""
        i += 1
    if w:
        res.append((i - len(w), i, w))
    return res

def _dist(a: str, b: str) -> int:
    la = len(a)
    lb = len(b)
    d = [[0]*(lb+1) for _ in range(la+1)]
    for i in range(la+1):
        d[i][0] = i
    for j in range(lb+1):
        d[0][j] = j
    for i in range(1, la+1):
        for j in range(1, lb+1):
            c = 0 if a[i-1] == b[j-1] else 1
            d[i][j] = min(d[i-1][j]+1, d[i][j-1]+1, d[i-1][j-1]+c)
    return d[la][lb]

def check(text: str):
    errs = []
    sugs = []
    syl = _syllables()
    for s, e, w in _tokens(text):
        if len(w) <= 2:
            continue
        if w in syl:
            continue
        errs.append({"start": s, "end": e, "word": w})
        cands = []
        for t in syl:
            score = _dist(w, t)
            if score <= max(1, len(w)//3):
                cands.append((t, score))
        cands.sort(key=lambda x: x[1])
        for t, score in cands[:3]:
            sugs.append({"original": w, "replacement": t, "score": score})
    return {"errors": errs, "suggestions": sugs}
