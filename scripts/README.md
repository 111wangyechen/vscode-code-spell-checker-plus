extract_terms.js 使用说明

前提：
- 本脚本使用 Node.js 内置的 fetch（Node 18+）并假设已安装 Node 20。

用法：

在仓库根目录下运行：

```powershell
node scripts/extract_terms.js streetsidesoftware/vscode-spell-checker
```

会生成 `generated/terms.json`，包含从 README 中提取的候选术语。

注意：这是一个非常简单的原型，用于词汇候选采集。后续应扩展：
- 支持从多文件/源码中抽取
- 过滤停用词
- 合并大小写/连字符/下划线变体
- 使用语言识别与中文/日文分词
