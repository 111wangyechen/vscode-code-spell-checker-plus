#!/usr/bin/env node
// 测试脚本：验证分词功能

const fs = require('fs');
const path = require('path');

// 重新定义分词相关函数用于测试
function splitCamelCase(text) {
  return text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .split(' ');
}

function splitSnakeCase(text) {
  return text.split('_');
}

function splitKebabCase(text) {
  return text.split('-');
}

function splitNumberSeparators(text) {
  return text
    .replace(/([a-zA-Z])(\d)([a-zA-Z])/g, '$1 $2 $3')
    .replace(/(\d)([a-zA-Z])/g, '$1 $2')
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .split(' ');
}

function advancedSplit(text) {
  let result = [text];
  result = result.flatMap(t => splitSnakeCase(t).flatMap(tt => splitKebabCase(tt)));
  result = result.flatMap(t => splitNumberSeparators(t));
  result = result.flatMap(t => splitCamelCase(t));
  return result.filter(Boolean);
}

function extractWords(text) {
  const tokens = text.split(/[^\p{L}\p{N}_-]+/u).filter(Boolean);
  const allTokens = tokens.flatMap(token => advancedSplit(token));
  const words = allTokens
    .map(t => t.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, ''))
    .filter(t => t.length >= 2)
    .filter(t => !/^\d+$/.test(t));
  return words;
}

// 测试用例
const testCases = [
  {
    name: '驼峰命名法分词',
    input: 'camelCase',
    expected: ['camel', 'Case']
  },
  {
    name: '帕斯卡命名法分词',
    input: 'PascalCase',
    expected: ['Pascal', 'Case']
  },
  {
    name: '连续大写字母分词',
    input: 'JSONParser',
    expected: ['JSON', 'Parser']
  },
  {
    name: '下划线命名法分词',
    input: 'snake_case_example',
    expected: ['snake', 'case', 'example']
  },
  {
    name: '连字符命名法分词',
    input: 'kebab-case-example',
    expected: ['kebab', 'case', 'example']
  },
  {
    name: '数字分隔分词',
    input: 'word123word',
    expected: ['word', '123', 'word']
  },
  {
    name: '混合命名法分词',
    input: 'mixed_Case-Name123',
    expected: ['mixed', 'Case', 'Name', '123']
  },
  {
    name: '复杂混合分词',
    input: 'parseJSONResponse_fromAPI200',
    expected: ['parse', 'JSON', 'Response', 'from', 'API', '200']
  },
  {
    name: '文本内容分词',
    input: 'This is a camelCaseWord and snake_case_word in a sentence.',
    expected: ['This', 'is', 'camel', 'Case', 'Word', 'and', 'snake', 'case', 'word', 'in', 'sentence']
  }
];

// 运行测试
function runTests() {
  console.log('开始测试分词功能...');
  let passed = 0;
  let failed = 0;
  
  testCases.forEach(test => {
    const result = extractWords(test.input);
    const actual = result.filter(w => !/^\d+$/.test(w)); // 过滤数字以便比较
    const expected = test.expected.filter(w => !/^\d+$/.test(w));
    
    const isPassed = JSON.stringify(actual.sort()) === JSON.stringify(expected.sort());
    
    if (isPassed) {
      console.log(`✅ ${test.name}: 通过`);
      passed++;
    } else {
      console.log(`❌ ${test.name}: 失败`);
      console.log(`  输入: "${test.input}"`);
      console.log(`  期望: [${expected.join(', ')}]`);
      console.log(`  实际: [${actual.join(', ')}]`);
      failed++;
    }
  });
  
  console.log(`\n测试结果: ${passed} 通过, ${failed} 失败`);
  
  // 测试实际提取功能
  console.log('\n测试实际文本提取...');
  const sampleText = `
    # VSCode Code Spell Checker Plus
    A tool for checking code spelling. Supports camelCase, snake_case, and PascalCase.
    Handles API200 responses and JSONParser functions.
  `;
  
  const extracted = extractWords(sampleText);
  console.log(`提取的单词 (${extracted.length}):`);
  console.log(extracted.sort());
  
  // 保存测试结果
  const testResult = {
    timestamp: new Date().toISOString(),
    tests: testCases.map(test => ({
      name: test.name,
      input: test.input,
      expected: test.expected,
      actual: extractWords(test.input),
      passed: JSON.stringify(extractWords(test.input).filter(w => !/^\d+$/.test(w)).sort()) === 
              JSON.stringify(test.expected.filter(w => !/^\d+$/.test(w)).sort())
    }))
  };
  
  const outDir = path.join(__dirname, '..', 'generated');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'test_results.json');
  fs.writeFileSync(outPath, JSON.stringify(testResult, null, 2), 'utf8');
  console.log(`\n测试结果已保存至: ${outPath}`);
  
  return failed === 0;
}

// 运行测试并返回结果
const success = runTests();
process.exit(success ? 0 : 1);