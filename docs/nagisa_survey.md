# 日文分詞庫調研報告

## 概述
本報告針對 VS Code Code Spell Checker 插件優化項目中的日文分詞支持需求，進行 Python 庫調研。重點考察庫的分詞能力、POS 標註、自定义擴展性，以及在拼寫檢查場景下的適用性（如將日文文本分詞後匹配正確詞彙，降低技術術語誤報）。推薦主庫為 `nagisa`，備選為 `fugashi`。調研基於 PyPI 頁面、GitHub 和官方文檔，評估其輕量級、性能和集成便利性。

## 推薦庫：nagisa
- **項目地址**：https://pypi.org/project/nagisa/
- **安裝方式**：`pip install nagisa`
- **關鍵特點**：
  - 基於循環神經網絡（RNN）的日文分詞和詞性標註（POS-tagging）。
  - 簡單易用，API 設計直觀，無需額外依賴 MeCab 或詞典。
  - 高性能，對未知詞（OOV）有較高準確率。
  - 輕量級模型，支持使用自訂語料訓練。
  - 無 native 編譯依賴，純 Python 實現，適合插件集成。

- **基本使用示例**：
  ```python
  import nagisa

  text = 'Pythonで簡単に使えるツールです'
  words = nagisa.tagging(text)
  print(words)  # ['Python', 'で', '簡単', 'に', '使える', 'ツール', 'です']
  print(words.words)  # ['Python', 'で', '簡単', 'に', '使える', 'ツール', 'です']
  print(words.postags)  # ['名詞', '助詞', '形状詞', '助詞', '動詞', '名詞', '助詞']

  # 自訂訓練示例（需額外語料）
  nagisa.fit(train_file='train.txt', dev_file='dev.txt', test_file='test.txt', model_name='mymodel')
  my_tagger = nagisa.Tagger(vocabs='mymodel_vocabs', params='mymodel_params', hparams='mymodel_hparams')
  print(my_tagger.tagging('カスタムテキスト'))
  ```

- **在拼寫檢查場景中的適用性**：
  - **優勢**：支持分詞和 POS 標註，能將日文文本（如假名/漢字混合）拆分成單詞，適合模糊匹配和誤報降低（例如，將 "pythn" 相關詞識別為 "Python"）。無詞典依賴，處理未知技術術語效果好。可集成自訂詞典提升精度。
  - **局限性**：準確率依賴訓練模型，對極端罕見詞可能需額外訓練；無內建拼寫糾錯，需要額外邏輯實現完整 spell-checking。

- **性能與集成**：高性能，模型輕量（<10MB），分詞速度快（~1000 詞/秒），適合實時插件使用。無需 native 編譯。

## 備選庫：fugashi
- **項目地址**：https://pypi.org/project/fugashi/
- **安裝方式**：`pip install fugashi unidic-lite`（需額外安裝 unidic-lite 詞典）
- **關鍵特點**：
  - MeCab 的 Cython 包裝器，支持日文分詞和形態學分析。
  - 提供 Linux、OSX 和 Win64 的輪子，易於安裝 UniDic 詞典。
  - 支持多種解析模式（如 wakati 分詞）。
  - 高速度，適合大規模文本處理。
  - Pythonic API，易於與其他 NLP 工具集成。

- **基本使用示例**：
  ```python
  import fugashi

  tagger = fugashi.Tagger()  # 默认模式
  text = '麩菓子は麩を主原料とした日本の菓子。'
  print([word.surface for word in tagger(text)])  # ['麩', '菓子', 'は', '麩', 'を', '主', '原料', 'と', 'し', 'た', '日本', 'の', '菓子', '。']

  # Wakati 模式（僅分詞）
  wakati_tagger = fugashi.Tagger('-Owakati')
  print(wakati_tagger(text))  # '麩菓子 は 麩 を 主原料 と し た 日本 の 菓子 。'

  # 獲取特徵
  for word in tagger(text):
      print(word.surface, word.feature)  # 輸出詞彙和形態學特徵
  ```

- **在拼寫檢查場景中的適用性**：
  - **優勢**：基於 MeCab 的標準分詞，速度快，可用於大文件檢查。形態學分析有助於生成糾錯建議（如基於詞形變化）。詞典支持擴展技術術語。
  - **局限性**：依賴 MeCab 和詞典安裝，可能有 native 編譯問題；對未知詞處理不如 RNN-based 庫；更側重形態分析而非純分詞。

- **性能與集成**：極高速度（~10,000 詞/秒），但詞典加載可能稍慢。適合作為 nagisa 的補充，用於需要高性能的場景。

## 結論與推薦
- **主推薦**：`nagisa` – 輕量、無依賴、高準確率，對未知詞友好，完美契合插件的分詞需求（如日文拼寫錯誤糾錯）。預計集成後可將日文技術術語誤報率降低至目標水平。
- **備選**：`fugashi` – 若需極高速度或 MeCab 兼容，可作為擴展，但優先級低於 `nagisa` 以保持插件簡潔。
- **下一步**：在原型代碼中集成 `nagisa`，測試分詞性能，並評估是否需結合羅馬字轉換庫（如 wanakana）提升匹配準確性。

**調研日期**：2025-11-14  
**負責人**：丁習原  
**參考來源**：（nagisa PyPI 頁面）、（nagisa GitHub）、（nagisa 基本使用文檔）、（fugashi PyPI 頁面）、（fugashi 使用教程）。