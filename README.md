# VSCode Code Spell Checker Plus

一个增强版的VSCode拼写检查器插件，专为技术术语和专业领域词汇优化。

## 功能特点

- 📚 支持技术术语和专业领域词汇的智能识别
- 🔍 基于置信度和频率的术语推荐
- 📂 领域特定字典管理
- ⚡ 高性能术语检索和验证
- 🔄 术语版本管理和元数据跟踪
- 📝 支持术语变体识别

## 项目结构

```
├── src/
│   ├── components/    # 核心组件
│   │   ├── TermManager.ts    # 术语管理器
│   │   └── index.ts
│   ├── models/        # 数据模型
│   │   ├── Term.ts           # 术语接口
│   │   ├── DictionaryMetadata.ts  # 字典元数据
│   │   ├── DomainDictionary.ts    # 领域字典
│   │   ├── MainDictionary.ts      # 主字典
│   │   ├── QueryOptions.ts        # 查询选项
│   │   └── index.ts
│   ├── storage/       # 存储层
│   │   ├── FileStorage.ts    # 文件存储实现
│   │   └── index.ts
│   └── index.ts       # 入口文件
├── test/
│   └── __tests__/     # 测试文件
│       ├── models/
│       ├── components/
│       └── storage/
├── tsconfig.json
├── package.json
└── README.md
```

## 数据模型

### 术语(Term)

每个术语包含以下属性：

- `id`: 唯一标识符
- `text`: 术语文本
- `variations`: 术语变体列表
- `domains`: 所属领域列表
- `confidence`: 置信度(0-1)
- `frequency`: 使用频率
- `sources`: 术语来源
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

### 字典结构

- **主字典**: 包含所有术语和元数据
- **领域字典**: 按领域分类的术语集合
- **元数据**: 包含版本信息、生成时间和术语统计

## 安装

```bash
# 克隆仓库
git clone https://github.com/your-org/vscode-code-spell-checker-plus.git

# 进入项目目录
cd vscode-code-spell-checker-plus

# 安装依赖
npm install

# 构建项目
npm run build

# 运行测试
npm test
```

## 使用示例

### 初始化术语管理器

```typescript
import { TermManager } from './components';
import { FileStorage } from './storage';
import * as path from 'path';

// 创建存储实例
const storageDir = path.join(__dirname, 'dictionaries');
const storage = new FileStorage(storageDir);

// 初始化术语管理器
const termManager = new TermManager(storage);
```

### 添加和验证术语

```typescript
// 添加新术语
const newTerm = {
  id: 'react-component',
  text: 'ReactComponent',
  variations: ['react-component'],
  domains: ['frontend'],
  confidence: 0.9,
  frequency: 10,
  sources: ['documentation']
};

await termManager.addTerm(newTerm);

// 验证术语
const isTermValid = await termManager.isValidTerm('ReactComponent');

// 获取术语置信度
const confidence = await termManager.getTermConfidence('ReactComponent');
```

### 查询术语

```typescript
// 查询特定领域的术语
const frontendTerms = await termManager.queryTerms({ 
  domains: ['frontend'],
  limit: 10 
});

// 根据置信度过滤术语
const highConfidenceTerms = await termManager.queryTerms({
  confidenceThreshold: 0.85
});
```

## 开发指南

### 测试

运行单元测试：

```bash
npm test
```

### 调试

可以使用VSCode的内置调试功能来调试代码。项目配置了以下调试任务：

- **运行测试**: 调试单元测试
- **启动插件**: 调试VSCode插件功能

## 贡献

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交Issue或联系项目维护者。
