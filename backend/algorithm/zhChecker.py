def tokenize(text: str):
    res = []
    i = 0
    w = ""
    for ch in text:
        code = ord(ch)
        is_han = 0x4E00 <= code <= 0x9FFF
        if is_han:
            w += ch
        else:
            if w:
                res.append((i - len(w), i, w))
                w = ""
        i += 1
    if w:
        res.append((i - len(w), i, w))
    return res

def check(text: str):
    import json, os
    p = os.path.join(os.path.dirname(__file__), "..", "data", "zh_words.json")
    with open(p, "r", encoding="utf-8") as f:
        words = set(json.load(f))
    toks = tokenize(text)
    errs = []
    sugs = []
    def dist(a: str, b: str) -> int:
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
    for s, e, w in toks:
        if w not in words:
            errs.append({"start": s, "end": e, "word": w})
            cands = []
            for t in words:
                sc = dist(w, t)
                if sc <= max(1, len(w)//3):
                    cands.append((t, sc))
            cands.sort(key=lambda x: x[1])
            for t, sc in cands[:3]:
                sugs.append({"original": w, "replacement": t, "score": sc})
    return {"errors": errs, "suggestions": sugs, "tokens": toks}
