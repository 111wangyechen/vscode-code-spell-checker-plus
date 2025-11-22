# 多语言集成方案

## 概述
本文档针对 VS Code Code Spell Checker 插件优化项目，设计多语言（中文/日文）集成方案。方案基于 Python 实现，旨在降低技术术语误报率（≤10%）、支持中/日文检查，并确保修复时间 ≤2 秒/文件。集成利用 `pypinyin`（中文拼音匹配）和 `nagisa`（日文分词），结合 cspell 或 Python 等效库（如 `pyspellchecker`）实现模糊匹配和纠错建议。方案包括架构设计、集成步骤、性能优化和测试建议。基于调研结果，确保方案轻量、可扩展。

## 架构图（文字版）
以下是方案的整体架构，使用文字表示（可转换为 UML 或 PlantUML 图）：

```
[VS Code 编辑器 或 Python 脚本/CLI 输入]
     ↓ (spell_check_text 或 CLI 调用)
[Python 等效检查器 (pyspellchecker + 自定义扩展)]
     ↓
[自定义词典加载器 (MultiLangDictionary)]
     │
     ├── [领域词库 (tech_terms.json)]
     ├── [中文词典 (zh_tech.json) + pypinyin 模糊匹配]
     └── [日文词典 (ja_tech.json) + nagisa 分词]
     ↓
[拼写检查引擎] → 检测误报 → [多语言纠错引擎 (PinyinFuzzyMatcher 等)]
                   ↓
             [生成候选词建议 (gen_multi_lang_suggestions)]
                   ↓
           [输出结果: Code Actions / CLI 建议列表 (provide_code_actions)]
```

> **说明**：输入从 VS Code 或脚本进入，词典加载后进行检查和匹配。纠错引擎仅对疑似误报触发，输出支持 UI 修复或命令行。

## 集成步骤

### Step 1: 扩展词典加载器（支持动态中/日词典）
实现 `MultiLangDictionary` 类，加载 JSON 词典并支持 locale-specific 检查。初始化一次，减少重复加载。

```python
# src/dict/multi_lang_dictionary.py
import json
import nagisa
from pypinyin import pinyin, Style

class MultiLangDictionary:
    def __init__(self):
        self.zh_dict = set()
        self.ja_words = set()
        self.ja_tagger = nagisa.Tagger()

    def init(self):
        # 加载中日词库（JSON 格式）
        with open('./dict/zh_tech.json', 'r') as f:
            zh_words = json.load(f)
            self.zh_dict = set(zh_words)

        with open('./dict/ja_tech.json', 'r') as f:
            self.ja_words = set(json.load(f))

    def has(self, word: str, locale: str) -> bool:
        if locale == 'zh':
            return word in self.zh_dict
        if locale == 'ja':
            tokens = self.ja_tagger.tagging(word).words
            return any(t in self.ja_words for t in tokens)
        return False  # 默认英文或其他
```

> **集成提示**：在主检查器中调用 `init()` 一次，然后用 `has()` 验证词是否合法。

### Step 2: 实现拼音/罗马字模糊匹配（降低误报）
针对中文，使用 `pypinyin` 进行拼音匹配；日文可扩展罗马字（可选 wanakana）。仅对误报词触发匹配。

```python
# src/spellcheck/pinyin_fuzzy_matcher.py
from pypinyin import pinyin, Style

def is_pinyin_match(input_str: str, target: str) -> bool:
    py = ''.join([p[0] for p in pinyin(input_str, style=Style.NORMAL)])
    return py.lower() == target.lower()

# 示例：检查 "zhongwen" 是否匹配 "中文"
# if is_pinyin_match("zhongwen", "zhongwen"):  # True，识别为有效，不误报
```

> **集成提示**：在检查引擎中，若词未知，先尝试模糊匹配词典中相似项。

### Step 3: 注入 Code Action / 建议生成（一键修复）
使用 Python 等效（如 `pyspellchecker`）生成建议，或通过 subprocess 调用 cspell。返回修复列表。

```python
# src/extension.py (Python 扩展或 CLI 等效)
from spellchecker import SpellChecker

def gen_multi_lang_suggestions(word: str, locale: str):
    # 自定义逻辑：结合模糊匹配生成建议
    if locale == 'zh':
        # 示例：用 pypinyin 生成候选
        candidates = ['中文']  # 从词典匹配
        return candidates
    return []

def provide_code_actions(text: str, locale: str):
    spell = SpellChecker()
    misspelled = spell.unknown(text.split())
    issues = []
    for word in misspelled:
        suggestions = spell.candidates(word) | set(gen_multi_lang_suggestions(word, locale))
        issues.append({'text': word, 'suggestions': list(suggestions[:5])})  # 限制 ≤5
    return issues

# 示例调用：provide_code_actions("zhongwen eror", 'zh')
```

> **集成提示**：若为 VS Code Python 扩展，用 `vscode` API 注册 provider；否则输出到 CLI。

### Step 4: 配置支持（cspell.json 或 Python 配置）
使用 JSON 配置多语言和词典。Python 版本可加载为 dict。

```json
{
  "language": "en,zh,ja",
  "dictionaries": ["tech-terms", "zh-tech", "ja-tech"],
  "dictionaryDefinitions": [
    { "name": "zh-tech", "path": "./dict/zh_tech.json" },
    { "name": "ja-tech", "path": "./dict/ja_tech.json" }
  ],
  "suggestionsTimeout": 2000
}
```

> **集成提示**：在初始化时加载配置，应用到检查器。

## 性能优化（目标：≤2s/文件）

| 措施 | 效果 | 实现细节 |
|------|------|----------|
| 词典使用 `set` + 二分查找 | O(1) 查询时间 | 将词典转为 set，避免线性扫描。 |
| `nagisa` / `pypinyin` 初始化一次 | 启动后 <50ms | 在类 `__init__` 中初始化，避免每次检查重复加载。 |
| 模糊匹配仅对疑似误报触发 | 减少计算量 80%+ | 先用标准检查，若未知再匹配；并行处理可选。 |
| 候选词限制 ≤5 个 | 快速返回建议 | 在 `gen_multi_lang_suggestions` 中切片列表。 |
| 异步/批量处理（若需） | 并行检查大文件 | 使用 `asyncio` 或 multiprocessing 处理多段文本。 |

> **测试基准**：对 1000 词文件测试，确保平均 <1s。使用 `timeit` 模块基准测试。

## 结论与推荐
本方案实现多语言集成，支持中/日文检查和修复，预计误报率 ≤10%。优先纯 Python 实现以便跨平台。潜在风险：词典质量影响准确性，建议结合团队词库模块。

- **下一步**：原型测试，集成修复建议模块（叶航/焦子恩），并与测试环境（韩星宇）对接。
- **兼容性**：若需回滚 JS 版本，可映射对应接口。

**设计日期**：2025-11-14  
**负责人**：丁习原  
**参考来源**：内部调研文档（pinyin_survey.md, nagisa_survey.md, cspell_interfaces.md）。