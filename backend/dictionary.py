import json
import os

class Dictionary:
    def __init__(self):
        base = os.path.dirname(__file__)
        p_domain = os.path.join(base, "data", "domain_terms.json")
        with open(p_domain, "r", encoding="utf-8") as f:
            data = json.load(f)
        terms = []
        for v in data.values():
            terms.extend(v)
        p_en = os.path.join(base, "data", "en_words.json")
        if os.path.exists(p_en):
            with open(p_en, "r", encoding="utf-8") as f:
                en = json.load(f)
            terms.extend([t.lower() for t in en])
        self.terms = list(dict.fromkeys([t.lower() for t in terms]))
        self.set = set(self.terms)
    def is_known(self, w: str) -> bool:
        if w.isdigit():
            return True
        return w.lower() in self.set
    def all_terms(self):
        return self.terms
