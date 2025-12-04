# 技术设计

## 架构
- 前端使用 TypeScript 实现 VS Code 插件核心。
- 后端使用 Python 实现拼写检查与建议算法。
- 通过进程间通信使用 JSON 行在 stdin/stdout 上传递数据。

## 模块
- `src/extension.ts`: 激活插件、收集文本、生成诊断、注册 CodeAction。
- `src/bridge/pythonBridge.ts`: 启动 Python 进程并实现请求响应协议。
- `src/core/spellCheckerClient.ts`: 面向上层的客户端 API。
- `src/ui/codeActionProvider.ts`: 根据诊断提供快速修复。
- `backend/main.py`: 请求分发与检查、建议。
- `backend/dictionary.py`: 词库加载与查询。
- `backend/algorithm/suggestion.py`: Levenshtein 距离与建议生成。

## 通信协议
- 请求: `{ id, action, ... }`。
- 响应: `{ id, result }`。
- 动作: `ping`, `check`, `suggest`。

## 词库
- `backend/data/domain_terms.json` 按领域分类的术语集合。

## 性能
- 工具脚本 `tools/test/performance_test.py` 用于测量响应时延与质量。
