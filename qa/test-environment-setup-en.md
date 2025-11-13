# 术语词库模块测试环境搭建指南

## 1. 开发环境要求

| 组件 | 版本要求 | 用途 |
|------|---------|------|
| Node.js | v18.x 或更高 | 运行脚本和插件开发 |
| npm/yarn | 最新稳定版 | 包管理 |
| VS Code | 1.80.0 或更高 | 开发和测试插件 |
| Git | 2.30.0+ | 版本控制 |

## 2. 环境搭建步骤

### 2.1 安装基础依赖

```bash
# 安装 Node.js 和 npm（推荐使用 nvm）
# Windows 用户可以从官网下载安装包
# 安装后验证版本
node -v
npm -v

# 全局安装 VS Code 扩展开发工具
npm install -g @vscode/vsce
```

### 2.2 项目设置

```bash
# 进入项目目录
cd d:\Tare_projects\5351project_plan\vscode-code-spell-checker-plus

# 安装项目依赖
npm install

# 验证项目结构
ls -la
```

### 2.3 词库开发环境

```bash
# 创建必要的目录结构
mkdir -p generated qa/test-data

# 准备初始测试数据
cp -r scripts/testdata/* qa/test-data/

# 运行术语提取脚本（验证功能）
node scripts/extract_terms.js test
```

### 2.4 VS Code 插件测试环境

1. 打开 VS Code
2. 打开项目文件夹：`File > Open Folder`
3. 按 `F5` 启动调试会话
4. 在弹出的新 VS Code 窗口中测试插件功能

## 3. 测试数据准备

### 3.1 测试术语集

创建一个包含已知领域术语的测试文件：

```bash
# 创建测试数据文件
cat > qa/test-data/tech-terms-test.md << EOF
# 技术术语测试集

## 前端术语
React Vue Angular JavaScript TypeScript CSS HTML DOM JSON AJAX

## 后端术语
Node.js Express Django Flask Spring MySQL PostgreSQL REST API

## AI术语
TensorFlow PyTorch neural network machine learning deep learning NLP
EOF
```

### 3.2 参考结果文件

```bash
# 创建预期结果文件
cat > qa/test-data/expected-results.json << EOF
{
  "frontend": ["React", "Vue", "Angular", "JavaScript", "TypeScript", "CSS", "HTML", "DOM", "JSON", "AJAX"],
  "backend": ["Node.js", "Express", "Django", "Flask", "Spring", "MySQL", "PostgreSQL", "REST", "API"],
  "ai": ["TensorFlow", "PyTorch", "neural", "network", "machine", "learning", "deep", "NLP"]
}
EOF
```

## 4. 自动化测试配置

### 4.1 单元测试设置

```bash
# 安装测试框架
npm install --save-dev jest mocha chai

# 配置测试脚本（在 package.json 中添加）
# "scripts": {
#   "test": "jest",
#   "test:mocha": "mocha"
# }
```

### 4.2 测试覆盖率

```bash
# 安装覆盖率工具
npm install --save-dev nyc

# 配置覆盖率（在 package.json 中添加）
# "nyc": {
#   "all": true,
#   "include": ["src/**", "scripts/**"],
#   "exclude": ["**/node_modules/**", "**/test/**"]
# }
```

## 5. 环境验证

### 5.1 运行基础测试

```bash
# 验证术语提取功能
node scripts/extract_terms.js qa/test-data/tech-terms-test.md

# 验证术语分类功能
node scripts/classify_terms.js

# 检查生成的文件
ls -la generated/
```

### 5.2 VS Code 插件验证

1. 在调试窗口中打开一个包含技术术语的文件
2. 验证拼写检查是否正常工作
3. 确认技术术语不被标记为拼写错误

## 6. 常见问题排查

### 6.1 Node.js 版本问题

```bash
# 如果遇到版本兼容性问题，可以使用 nvm 切换版本
# 安装 nvm 后
nvm install 18
nvm use 18
```

### 6.2 依赖安装失败

```bash
# 清除缓存重试
npm cache clean --force
npm install

# 或使用 yarn
npm install -g yarn
yarn install
```

### 6.3 VS Code 调试问题

- 确保 VS Code 版本符合要求
- 检查 .vscode/launch.json 配置是否正确
- 尝试重新安装依赖并重启 VS Code

## 7. 环境维护

### 7.1 依赖更新

```bash
# 定期更新依赖
npm update
# 或
npm-check-updates -u
npm install
```

### 7.2 测试数据更新

随着项目进展，需要定期更新测试数据以覆盖新功能和边界情况。

## 8. 资源链接

- [VS Code 扩展开发文档](https://code.visualstudio.com/api)
- [Node.js 官方文档](https://nodejs.org/docs/)
- [Jest 测试框架文档](https://jestjs.io/docs/getting-started)

---

环境搭建完成后，请运行环境验证步骤确保所有组件正常工作。