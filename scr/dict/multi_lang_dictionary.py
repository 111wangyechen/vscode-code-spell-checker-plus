# src/dict/multi_lang_dictionary.py

import json
import nagisa
from pypinyin import pinyin, Style  # 导入以支持潜在扩展，但本类中未直接使用（见模糊匹配模块）

class MultiLangDictionary:
    """
    多语言词典加载器类，支持中文和日文技术术语词库加载。
    - zh_dict: 中文词典，使用 set 存储以实现 O(1) 查询。
    - ja_words: 日文词典，使用 set 存储。
    - ja_tagger: nagisa 分词器，用于日文词分词检查。
    """

    def __init__(self):
        """
        初始化词典和分词器。
        """
        self.zh_dict = set()
        self.ja_words = set()
        self.ja_tagger = nagisa.Tagger()  # 初始化 nagisa 分词器，一次性加载以优化性能

    def init(self):
        """
        加载中/日词库从 JSON 文件。
        假设文件路径为 './dict/zh_tech.json' 和 './dict/ja_tech.json'，内容为词列表。
        """
        try:
            with open('./dict/zh_tech.json', 'r', encoding='utf-8') as f:
                zh_words = json.load(f)
                self.zh_dict = set(zh_words)  # 直接转为 set，避免循环添加以提升效率

            with open('./dict/ja_tech.json', 'r', encoding='utf-8') as f:
                ja_words = json.load(f)
                self.ja_words = set(ja_words)
        except FileNotFoundError as e:
            raise FileNotFoundError(f"词库文件未找到: {e}")
        except json.JSONDecodeError as e:
            raise ValueError(f"JSON 解析错误: {e}")

    def has(self, word: str, locale: str) -> bool:
        """
        检查词是否在对应语言词典中。
        - locale: 'zh' 为中文，'ja' 为日文，其他返回 False。
        - 对于日文，使用 nagisa 分词后检查任意 token 是否在词典中。
        """
        if locale == 'zh':
            return word in self.zh_dict
        if locale == 'ja':
            tokens = self.ja_tagger.tagging(word).words
            return any(t in self.ja_words for t in tokens)
        return False  # 默认不支持其他语言，返回 False

# 示例使用（测试代码，可移除）
if __name__ == "__main__":
    dict_loader = MultiLangDictionary()
    dict_loader.init()
    print(dict_loader.has("中文", 'zh'))  # 假设 "中文" 在 zh_tech.json 中，应返回 True
    print(dict_loader.has("Pythonで", 'ja'))  # 分词后检查，应根据 ja_tech.json 返回
```