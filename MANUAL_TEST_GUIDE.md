# VSCode拼写检查扩展手动操作指南

## 一、项目构建

1. **打开终端**：在VSCode中打开终端（快捷键：`Ctrl+`）

2. **导航到项目根目录**：
   ```bash
   cd d:/Tare_projects/vscode-spell-checker
   ```

3. **安装依赖**：
   ```bash
   npm install
   ```

4. **构建项目**：
   ```bash
   npm run build
   ```

   构建成功后，会看到类似的输出：
   ```
   ✔ Build complete in XXXms
   ```

## 二、启动VSCode扩展开发环境

1. **启动扩展开发主机**：
   ```bash
   code --disable-extensions --extensionDevelopmentPath=packages/client
   ```

   这将打开一个新的VSCode窗口，专门用于测试扩展。

2. **确认扩展已加载**：
   - 在新打开的VSCode窗口中，点击左下角的扩展图标
   - 检查是否看到"Code Spell Checker"扩展已启用

## 三、创建测试文件

1. **创建JavaScript测试文件**：
   - 在新VSCode窗口中，点击"文件" > "新建文件"
   - 输入以下内容：
     ```javascript
     // 测试拼写检查功能
     const tensorflow = require('tensrflow'); // 故意拼写错误：tensrflow
     const ReactDOM = require('react-dom');
     const nodejs = require('nodej'); // 故意拼写错误：nodej
     
     // 其他代码
     console.log('测试拼写检查');
     ```
   - 保存文件为：`test-spell-check.js`

## 四、测试拼写错误检测功能

1. **观察拼写错误标记**：
   - 在测试文件中，观察到`'tensrflow'`和`'nodej'`这两个词下方有红色波浪线标记
   - 这表示扩展已检测到这些拼写错误

2. **查看拼写错误详情**：
   - 将鼠标悬停在有红色波浪线的单词上
   - 会显示错误提示："Unknown word (tensrflow)"

## 五、测试拼写建议功能

1. **获取拼写建议**：
   - 右键点击有红色波浪线的单词（如`tensrflow`）
   - 在上下文菜单中选择"快速修复"（或使用快捷键`Ctrl+.`）

2. **查看建议列表**：
   - 在弹出的修复选项中，会看到针对`tensrflow`的拼写建议
   - 其中应该包含正确的拼写`tensorflow`

3. **应用拼写建议**：
   - 点击建议列表中的`tensorflow`
   - 观察到文件中的`tensrflow`已被自动更正为`tensorflow`

4. **测试另一个拼写错误**：
   - 对`nodej`重复上述步骤
   - 查看是否有`nodejs`的拼写建议

## 六、使用命令行工具测试

1. **返回原终端窗口**：
   - 回到最初打开的VSCode终端窗口

2. **使用cspell命令行检测拼写错误**：
   ```bash
   npx cspell test-spell-check.js
   ```

   输出结果应该显示检测到的拼写错误：
   ```
   test-spell-check.js:2:29 - Unknown word (tensrflow)
   test-spell-check.js:4:25 - Unknown word (nodej)
   ```

## 七、运行单元测试

1. **运行特定的单元测试**：
   ```bash
   npx vitest run packages/_server/src/validator.test.mts
   ```

   输出结果应该显示所有测试都通过，包括我们之前添加的tensorflow测试案例：
   ```
   ✓ packages/_server/src/validator.test.mts (14 tests)
   ```

## 八、验证自定义技术术语

1. **检查技术术语词典**：
   ```bash
   cat sampleDictionaries/tech-terms/*
   ```

   查看是否包含`tensorflow`、`ReactDOM`、`nodejs`等技术术语

2. **在测试文件中添加新的技术术语**：
   - 在测试文件中添加一行：`const pytorch = require('pytorch');`
   - 检查`pytorch`是否被标记为拼写错误

## 九、清理测试文件

1. **删除测试文件**：
   ```bash
   rm test-spell-check.js
   ```

## 十、总结演示要点

在演示过程中，重点展示以下功能：

1. ✅ 拼写错误自动检测（红色波浪线）
2. ✅ 拼写错误提示信息
3. ✅ 拼写建议功能
4. ✅ 一键修复拼写错误
5. ✅ 技术术语识别
6. ✅ 命令行工具的使用
7. ✅ 单元测试验证

通过以上步骤，您可以完整地演示VSCode拼写检查扩展的核心功能，特别是技术术语拼写不全的检测和修复能力。
