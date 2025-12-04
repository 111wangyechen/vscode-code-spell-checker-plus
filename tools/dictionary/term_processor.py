import json
import sys

def process(raw):
    out = {}
    for k, v in raw.items():
        out[k] = sorted(list(set(v)))
    return out

def main():
    if len(sys.argv) > 1:
        p = sys.argv[1]
        with open(p, "r", encoding="utf-8") as f:
            raw = json.load(f)
        out = process(raw)
        print(json.dumps(out, ensure_ascii=False))
    else:
        print(json.dumps(process({"frontend": ["react", "react"], "backend": ["server"], "ai": ["model"]}), ensure_ascii=False))

if __name__ == "__main__":
    main()
