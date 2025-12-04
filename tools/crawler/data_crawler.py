import json

def crawl():
    return {"frontend": ["react", "component"], "backend": ["server"], "ai": ["model"]}

def main():
    data = crawl()
    print(json.dumps(data, ensure_ascii=False))

if __name__ == "__main__":
    main()
