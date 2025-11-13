# Technical Term Crawler Script and Dictionary Storage Format Design

## 1. 爬虫脚本规则设计

### 1.1 数据源扩展
- **GitHub Top 100 项目**：按领域分类爬取前端、后端、AI项目
- **文档源**：
  - README.md
  - CHANGELOG.md
  - 技术文档目录（docs/）
  - 代码注释（.js, .ts, .tsx, .jsx, .py等源文件）
- **API集成**：使用GitHub API v4（GraphQL）获取项目元数据和语言信息

### 1.2 术语提取规则
- **分词策略**：
  - 保留连字符词：如`data-structure`
  - 支持驼峰分词：`camelCase` → `camel` + `Case`
  - 支持帕斯卡分词：`PascalCase` → `Pascal` + `Case`
  - 支持下划线分词：`snake_case` → `snake` + `case`
  - 支持数字分隔分词：`v1.0` → `v` + `1` + `0`，`api2` → `api` + `2`
- **过滤规则**：
  - 最小长度：2个字符（技术缩写如`js`也应保留）
  - 最大长度：50个字符
  - 去除纯数字
  - 去除URL、邮箱、哈希值
  - 去除通用停用词
  - 去除低频率词（出现次数<3次）

### 1.3 领域识别增强
- **扩展关键词规则**：
  - 前端：增加框架特定术语（nextjs, remix, astro等）
  - 后端：增加微服务、云原生相关术语
  - AI：增加更多深度学习、大模型相关术语
- **上下文分析**：根据术语出现的上下文和周围关键词调整分类权重
- **置信度评分**：使用多因素评分系统（关键词匹配度、上下文相关性、出现频率）

### 1.4 爬取优化
- **并发控制**：限制并发请求数，避免触发GitHub API限制
- **缓存机制**：缓存已爬取的项目数据
- **错误处理**：完善重试机制和异常处理
- **增量更新**：支持增量爬取，只处理新的或更新的项目

## 2. 词库存储格式设计

### 2.1 主词库文件（terms.json）
```json
{
  "metadata": {
    "version": "1.0",
    "generated_at": "2024-11-12T08:00:00Z",
    "source_projects": 100,
    "total_terms": 2000
  },
  "terms": [
    {
      "term": "TypeScript",
      "variations": ["typescript", "TS"],
      "domains": ["frontend"],
      "confidence": 0.95,
      "frequency": 150,
      "contexts": ["language", "superset of JavaScript"]
    },
    // 更多术语...
  ]
}
```

### 2.2 领域词库文件（terms-{domain}.json）
按领域分类存储，格式如下：
```json
{
  "domain": "frontend",
  "count": 500,
  "terms": [
    {
      "term": "React",
      "variations": ["react", "reactjs"],
      "confidence": 0.98,
      "frequency": 200
    },
    // 更多术语...
  ]
}
```

### 2.3 术语置信度文件（terms-confidence.json）
```json
{
  "TypeScript": 0.95,
  "React": 0.98,
  "NodeJS": 0.92,
  // 更多术语...
}
```

### 2.4 元数据摘要文件（terms-summary.json）
```json
{
  "version": "1.0",
  "generated_at": "2024-11-12T08:00:00Z",
  "total": 2000,
  "frontend": 500,
  "backend": 700,
  "ai": 300,
  "other": 500,
  "source_projects": {
    "frontend": 35,
    "backend": 35,
    "ai": 30
  }
}
```

## 3. 实现建议

### 3.1 爬虫脚本结构
```javascript
// 核心模块
- fetchProjectData.js  // 获取项目元数据
- extractTerms.js      // 术语提取
- classifyTerms.js     // 术语分类
- storeTerms.js        // 词库存储

// 工具函数
- utils/stringUtils.js // 字符串处理工具
- utils/fileUtils.js   // 文件操作工具
- utils/apiUtils.js    // API调用工具
```

### 3.2 性能优化
- 使用流式处理大型文本文件
- 采用内存映射技术处理大规模词库
- 实现索引机制加速查询
- 使用Worker线程并行处理术语提取和分类

### 3.3 扩展性设计
- 插件化架构，支持添加新的数据源
- 可配置的提取规则和分类算法
- 支持自定义领域和关键词
- 提供API接口供其他工具使用

## 4. 版本兼容性
确保新的词库格式与现有插件代码兼容，同时提供迁移机制将旧格式升级到新格式。