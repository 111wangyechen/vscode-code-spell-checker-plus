# vscode-code-spell-checker-plus
This is an optimization project for the VScode-spell-checker plugin.
### 1. Research Objectives

Focus on the core requirement of "optimizing technical term false positives" for the plugin, select an extraction scheme that is "highly accurate, easy to implement, and suitable for technical scenarios", support the goal of "false positive rate ≤ 10%", and provide a technical basis for lexicon construction.

### 2. Comparative Analysis of Mainstream Schemes

| Extraction Scheme                                          | Core Implementation                                          | Advantages                                                   | Disadvantages                                                | Application Scenarios                                        | Expected Accuracy |
| ---------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ----------------- |
| Rule-Driven Extraction (High-Frequency + Format Filtering) | 1. Count high-frequency words in GitHub project source code/documents;2. Filter technical term feature formats (camelCase, snake_case, abbreviations, special characters included);3. Remove common English words (the, function) | 1. Low development cost, rapid implementation;2. Adapt to technical term formats (e.g., SpringBoot, K8s, @Component);3. No tool dependencies, easy maintenance | 1. Prone to mixing project-specific variable names;2. Weak recognition of abbreviated terms (e.g., IOC) | Basic lexicon construction, rapid expansion of vocabulary    | 75%-80%           |
| Open-Source Tool Integration Extraction (NLTK + jieba)     | 1. NLTK for English part-of-speech tagging (filter nouns/proper nouns);2. jieba for Chinese technical document word segmentation;3. Filter with programming domain dictionaries | 1. Accurate part-of-speech filtering, reducing common word interference;2. Support mixed Chinese-English terms (e.g., "分词 jieba");3. High customization | 1. Need to integrate multiple tools, moderate development complexity;2. Need to maintain domain dictionaries | Medium-to-high frequency term extraction, supporting both Chinese and English scenarios | 85%-90%           |
| GitHub Metadata Extraction (README + Annotations + Issues) | 1. Crawl metadata of GitHub Top 100 projects;2. Extract project descriptions, framework names, core function words;3. Associate project tags (frontend/backend/AI) | 1. Strong binding between terms and technical scenarios, high relevance;2. Access to latest terms (e.g., Vue3, SpringBoot3);3. Naturally carries domain attributes | 1. Need to process unstructured text (colloquial content in Issues);2. Need to adapt to GitHub API limits | Core term extraction, ensuring domain accuracy               | 88%-92%           |

### 3. Scheme Selection
**Recommended hybrid strategy: "GitHub metadata as the core, supplemented by rules + tools"**

- Core source: GitHub metadata extraction (ensuring technical relevance and domain attributes of terms);
- Supplementary source: Rule-driven extraction (rapidly expanding vocabulary, covering common technical words);
- Optimization filtering: Open-source tool integration (part-of-speech tagging + format verification, improving accuracy).
- ### 4. Implementation Considerations

- Format adaptation: Support technical term formats such as camelCase, snake_case, abbreviations, special characters (@/#), and mixed Chinese-English;
- Redundancy filtering: Build a common word filter library (common English words, programming keywords like if/for);
- Field retention: Record "term + source project + domain tag + occurrence frequency" during extraction to lay the foundation for subsequent classification.
