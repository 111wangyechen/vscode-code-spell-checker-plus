def tokenize(text: str):
    res = []
    i = 0
    w = ""
    t = None
    def type_of(ch):
        code = ord(ch)
        if 0x3040 <= code <= 0x309F:
            return "hira"
        if 0x30A0 <= code <= 0x30FF:
            return "kana"
        return None
    for ch in text:
        ct = type_of(ch)
        if ct is not None:
            if t is None or t == ct:
                w += ch
                t = ct
            else:
                res.append((i - len(w), i, w, t))
                w = ch
                t = ct
        else:
            if w:
                res.append((i - len(w), i, w, t))
                w = ""
                t = None
        i += 1
    if w:
        res.append((i - len(w), i, w, t))
    return res

def check(text: str):
    import json, os
    p = os.path.join(os.path.dirname(__file__), "..", "data", "ja_words.json")
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
    seen = set()
    for idx in range(len(toks)):
        s, e, w, tt = toks[idx]
        key = (s, e, w)
        if w in words:
            continue
        errs.append({"start": s, "end": e, "word": w})
        seen.add(key)
        cands = []
        for t in words:
            sc = dist(w, t)
            if sc <= max(1, len(w)//3):
                cands.append((t, sc))
        cands.sort(key=lambda x: x[1])
        for t, sc in cands[:3]:
            sugs.append({"original": w, "replacement": t, "score": sc})
        if tt == "kana" and idx + 1 < len(toks):
            s2, e2, w2, tt2 = toks[idx + 1]
            if tt2 == "hira" and w2 in {"る", "する"}:
                comb = w + w2
                if comb not in words:
                    key2 = (s, e2, comb)
                    if key2 not in seen:
                        errs.append({"start": s, "end": e2, "word": comb})
                        seen.add(key2)
                    cc = []
                    for t in words:
                        sc2 = dist(comb, t)
                        if sc2 <= max(1, len(comb)//3):
                            cc.append((t, sc2))
                    cc.sort(key=lambda x: x[1])
                    for t, sc2 in cc[:3]:
                        sugs.append({"original": comb, "replacement": t, "score": sc2})
    return {"errors": errs, "suggestions": sugs, "tokens": toks}
