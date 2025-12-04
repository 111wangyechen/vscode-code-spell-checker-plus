# Multi-language Spell Checker 用户手册

## 安装
- 在 VS Code 中打开本项目，运行 `npm install`。
- 运行 `npm run build` 进行编译。
- 使用 VS Code 扩展开发主机进行调试。

## 配置
- `spellChecker.pythonPath`: Python 可执行路径。
- `spellChecker.enabledLanguages`: 启用语言列表。

## 使用
- 打开文件后自动分析，或执行命令 `Spell Checker Scan`。
- 发现可疑词时在编辑器中出现诊断标记。
- 通过 Quick Fix 提供替换建议。

## 说明
- 插件通过标准输入输出与 Python 后端交互，传输 JSON 行数据。
