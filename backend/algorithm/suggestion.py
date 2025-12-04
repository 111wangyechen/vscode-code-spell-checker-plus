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

def suggest_for(w: str, dict_obj):
    res = []
    lw = w.lower()
    for t in dict_obj.all_terms():
        s = dist(lw, t)
        if s <= max(1, len(lw)//3):
            res.append((t, s))
    res.sort(key=lambda x: x[1])
    return res[:5]
