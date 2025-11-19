#!/usr/bin/env node
// 增强的术语提取脚本
// 用法: node scripts/extract_terms.js [repo1 repo2 ...] [--files pattern] [--cache] [--concurrency 10]
// repo 参数格式: owner/repo，如: streetsidesoftware/vscode-spell-checker
// --files 参数: 指定要提取的文件模式，如 "**/*.ts,**/*.md"
// --cache 参数: 启用缓存机制
// --concurrency 参数: 设置并发处理数量，默认为10

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

// 配置常量
const CONCURRENCY_LIMIT = 10; // 默认并发限制
const CACHE_DIR = path.join(__dirname, '..', '.cache');
const CACHE_EXTENSION = '.json';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24小时缓存有效期

// 配置默认文件模式
const DEFAULT_FILE_PATTERNS = ['**/*.ts', '**/*.js', '**/*.jsx', '**/*.tsx', '**/*.md', '**/*.json'];
const IGNORE_PATTERNS = ['**/node_modules/**', '**/dist/**', '**/build/**', '**/coverage/**', '**/.cache/**'];

// 提取代码注释的正则表达式
const CODE_COMMENT_REGEX = {
  singleLine: /\/\/[^\n]*/g,          // // 单行注释
  multiLine: /\/\*[\s\S]*?\*\//g,     // /* 多行注释 */
  jsDoc: /\/\*\*[\s\S]*?\*\//g       // /** JSDoc 注释 */
};

function extractComments(code) {
  const comments = [];
  
  // 提取 JSDoc 注释（优先级最高，避免被多行注释重复提取）
  let jsDocMatch;
  while ((jsDocMatch = CODE_COMMENT_REGEX.jsDoc.exec(code)) !== null) {
    comments.push(jsDocMatch[0]);
  }
  
  // 提取多行注释（过滤掉已提取的 JSDoc 注释）
  let filteredCode = code;
  CODE_COMMENT_REGEX.jsDoc.lastIndex = 0;
  while ((jsDocMatch = CODE_COMMENT_REGEX.jsDoc.exec(code)) !== null) {
    filteredCode = filteredCode.replace(jsDocMatch[0], ' '.repeat(jsDocMatch[0].length));
  }
  
  let multiLineMatch;
  while ((multiLineMatch = CODE_COMMENT_REGEX.multiLine.exec(filteredCode)) !== null) {
    comments.push(multiLineMatch[0]);
  }
  
  // 提取单行注释
  let singleLineMatch;
  while ((singleLineMatch = CODE_COMMENT_REGEX.singleLine.exec(code)) !== null) {
    comments.push(singleLineMatch[0]);
  }
  
  // 清理注释标记
  return comments.map(comment => {
    // 移除注释标记和多余空白
    return comment
      .replace(/^\/\/*\s*|\s*\*\/\s*$/g, '')  // 移除首尾注释标记
      .replace(/^\s*\*\s*/gm, '')               // 移除多行注释中的每行前缀
      .trim();
  });
}

async function fetchRawReadme(ownerRepo) {
  const [owner, repo] = ownerRepo.split('/');
  // 优先尝试本地克隆的上游仓库（如果存在）
  try {
    const localPath = path.join(__dirname, '..', '..', repo, 'README.md');
    if (fs.existsSync(localPath)) {
      return fs.readFileSync(localPath, 'utf8');
    }
  } catch (e) {
    // ignore local read errors
  }

  const branches = ['main', 'master'];
  for (const b of branches) {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${b}/README.md`;
    try {
      const res = await fetch(url);
      if (res.ok) return await res.text();
    } catch (e) {
      // ignore and try next
    }
  }
  return '';
}

function extractFilesFromLocalRepo(repoPath, filePatterns) {
  const files = [];
  
  try {
    filePatterns.forEach(pattern => {
      const matchedFiles = globSync(pattern, {
        cwd: repoPath,
        ignore: IGNORE_PATTERNS,
        nodir: true
      });
      
      matchedFiles.forEach(file => {
        const fullPath = path.join(repoPath, file);
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
          files.push(fullPath);
        }
      });
    });
  } catch (error) {
    console.warn('Error extracting files from local repo:', error.message);
  }
  
  return files;
}

// 缓存相关函数
function getCacheFilePath(key) {
  const safeKey = key.replace(/[^a-zA-Z0-9]/g, '_');
  return path.join(CACHE_DIR, `${safeKey}${CACHE_EXTENSION}`);
}

function getCache(key) {
  try {
    const cachePath = getCacheFilePath(key);
    if (!fs.existsSync(cachePath)) return null;
    
    const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    const now = Date.now();
    
    // 检查缓存是否过期
    if (now - cacheData.timestamp > CACHE_TTL) {
      fs.unlinkSync(cachePath);
      return null;
    }
    
    return cacheData.data;
  } catch (error) {
    console.warn(`Cache read error: ${error.message}`);
    return null;
  }
}

function setCache(key, data) {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    
    const cachePath = getCacheFilePath(key);
    const cacheData = {
      timestamp: Date.now(),
      data: data
    };
    
    fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2), 'utf8');
  } catch (error) {
    console.warn(`Cache write error: ${error.message}`);
  }
}

// 并发控制函数
async function runWithConcurrencyLimit(items, concurrency, processor) {
  const results = [];
  const inProgress = new Set();
  
  async function processQueue() {
    while (items.length > 0 && inProgress.size < concurrency) {
      const item = items.shift();
      const promise = processor(item).finally(() => {
        inProgress.delete(promise);
      });
      
      inProgress.add(promise);
      results.push(promise);
      
      // 当队列还有项目时，继续处理
      if (items.length > 0) {
        processQueue();
      }
    }
    
    // 等待所有进行中的处理完成
    if (inProgress.size > 0) {
      await Promise.allSettled(Array.from(inProgress));
    }
  }
  
  await processQueue();
  
  // 过滤出成功的结果
  const successfulResults = [];
  for (const result of await Promise.allSettled(results)) {
    if (result.status === 'fulfilled') {
      successfulResults.push(result.value);
    } else {
      console.warn(`Item processing failed: ${result.reason.message || 'Unknown error'}`);
    }
  }
  
  return successfulResults;
}

async function readFileWithComments(filePath) {
  try {
    // 检查文件是否存在和可读
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      return {
        content: '',
        comments: ''
      };
    }
    
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      console.warn(`Not a file: ${filePath}`);
      return {
        content: '',
        comments: ''
      };
    }
    
    // 读取文件内容，添加错误处理
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 判断文件类型
    const extension = path.extname(filePath).toLowerCase();
    const isCodeFile = ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.html'].includes(extension);
    
    if (isCodeFile) {
      // 提取注释
      const comments = extractComments(content);
      return {
        content: content,
        comments: comments.join('\n\n')
      };
    } else {
      // 对于非代码文件，直接返回内容
      return {
        content: content,
        comments: ''
      };
    }
  } catch (error) {
    console.warn(`Error reading file ${filePath}:`, error.message);
    return {
      content: '',
      comments: ''
    };
  }
}

function splitCamelCase(text) {
  // 驼峰命名法分词: camelCase -> camel Case
  // 处理连续大写字母的情况: JSONParser -> JSON Parser
  return text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .split(' ');
}

function splitSnakeCase(text) {
  // 下划线命名法分词: snake_case -> snake case
  return text.split('_');
}

function splitKebabCase(text) {
  // 连字符命名法分词: kebab-case -> kebab case
  return text.split('-');
}

function splitNumberSeparators(text) {
  // 数字分隔分词: word123word -> word 123 word
  return text
    .replace(/([a-zA-Z])(\d)([a-zA-Z])/g, '$1 $2 $3')
    .replace(/(\d)([a-zA-Z])/g, '$1 $2')
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .split(' ');
}

function advancedSplit(text) {
  let result = [text];
  
  // 首先处理下划线和连字符
  result = result.flatMap(t => splitSnakeCase(t).flatMap(tt => splitKebabCase(tt)));
  
  // 然后处理数字分隔
  result = result.flatMap(t => splitNumberSeparators(t));
  
  // 最后处理驼峰和帕斯卡命名法
  result = result.flatMap(t => splitCamelCase(t));
  
  return result.filter(Boolean);
}

function extractWords(text) {
  // 1. 首先按非字母数字下划线连字符分割
  const tokens = text.split(/[^\p{L}\p{N}_-]+/u).filter(Boolean);
  
  // 2. 应用高级分词
  const allTokens = tokens.flatMap(token => advancedSplit(token));
  
  // 3. 清理和过滤
  const words = allTokens
    .map(t => t.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, ''))
    .filter(t => t.length >= 2) // 降低门槛，因为高级分词后可能出现更短的有效单词
    .filter(t => !/^\d+$/.test(t)); // 过滤纯数字
  
  return words;
}

// 分类算法和置信度评分
const COMMON_WORDS = new Set([
  'the', 'and', 'is', 'in', 'to', 'of', 'for', 'with', 'on', 'at',
  'by', 'as', 'from', 'are', 'this', 'that', 'which', 'or', 'but',
  'be', 'have', 'do', 'will', 'if', 'then', 'else', 'when', 'where',
  'who', 'what', 'why', 'how', 'not', 'all', 'any', 'each', 'some',
  'more', 'most', 'other', 'their', 'there', 'these', 'those', 'they'
]);

const TECHNICAL_PATTERNS = [
  /[A-Z]{2,}/, // 缩写
  /^[A-Z][a-z]+$/, // 类名风格
  /^[A-Z][a-z]+[A-Z][a-z]+$/, // 帕斯卡命名法
  /^(http|https|www)\./i, // URL相关
  /^(api|config|service|manager|handler|processor)$/i, // 常见技术术语
  /^(json|xml|html|css|js|ts|tsx|jsx)$/i, // 文件格式
  /^(npm|yarn|webpack|jest|mocha)$/i, // 开发工具
  /^(iso|uuid|id|uid)$/i // 标识符
];

function calculateConfidence(word, context, occurrences) {
  let score = 50; // 基础分
  
  // 基于单词特征的评分
  if (TECHNICAL_PATTERNS.some(pattern => pattern.test(word))) {
    score += 20;
  }
  
  if (word.length > 6) score += 5;
  if (word.length > 10) score += 5;
  
  if (COMMON_WORDS.has(word.toLowerCase())) {
    score -= 30;
  }
  
  // 基于上下文的评分
  if (context && context.includes('//')) score += 5;
  if (context && context.includes('*')) score += 5;
  
  // 基于出现频率的评分
  if (occurrences > 3) score += 10;
  if (occurrences > 5) score += 10;
  
  // 确保分数在0-100之间
  return Math.max(0, Math.min(100, score));
}

function classifyTerm(word, confidence) {
  if (confidence >= 70) return 'technical';
  if (confidence >= 40) return 'domain_specific';
  return 'common';
}

function extractTermsWithMetadata(text, context, termMap) {
  const words = extractWords(text);
  
  for (const word of words) {
    const key = word.toLowerCase();
    
    if (!termMap.has(key)) {
      termMap.set(key, {
        term: word,
        occurrences: 0,
        contexts: [],
        sources: new Set()
      });
    }
    
    const termInfo = termMap.get(key);
    termInfo.occurrences++;
    
    if (context && termInfo.contexts.length < 5) {
      termInfo.contexts.push(context.slice(0, 100)); // 限制上下文长度
    }
    
    if (context && context.includes('src/')) {
      termInfo.sources.add('source_code');
    }
    if (context && (context.includes('//') || context.includes('/*'))) {
      termInfo.sources.add('comments');
    }
  }
  
  return termMap;
}

function finalizeTerms(termMap) {
  const results = [];
  
  termMap.forEach(termInfo => {
    const confidence = calculateConfidence(
      termInfo.term,
      termInfo.contexts.join(' '),
      termInfo.occurrences
    );
    
    results.push({
      term: termInfo.term,
      confidence: confidence,
      category: classifyTerm(termInfo.term, confidence),
      occurrences: termInfo.occurrences,
      sources: Array.from(termInfo.sources),
      sampleContexts: termInfo.contexts.slice(0, 3)
    });
  });
  
  // 按置信度和出现次数排序
  return results.sort((a, b) => {
    if (a.confidence !== b.confidence) {
      return b.confidence - a.confidence;
    }
    return b.occurrences - a.occurrences;
  });
}

async function processFile(fileInfo) {
  const { file, repoPath, useCache } = fileInfo;
  const relativePath = path.relative(repoPath, file);
  
  // 尝试从缓存获取结果
  if (useCache) {
    const cacheKey = `file_${file}_${fs.statSync(file).mtimeMs}`;
    const cachedResult = getCache(cacheKey);
    if (cachedResult) {
      console.log(`[CACHE HIT] ${relativePath}`);
      return cachedResult;
    }
  }
  
  try {
    const { content, comments } = await readFileWithComments(file);
    const fileTermMap = new Map();
    
    // 从代码内容提取术语（带上下文）
    if (content) {
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.trim()) {
          extractTermsWithMetadata(line, line, fileTermMap);
        }
      }
    }
    
    // 从注释提取术语（带上下文）
    if (comments) {
      const commentLines = comments.split('\n');
      for (const line of commentLines) {
        if (line.trim()) {
          extractTermsWithMetadata(line, line, fileTermMap);
        }
      }
    }
    
    // 转换为对象数组
    const fileTerms = [];
    fileTermMap.forEach(termInfo => {
      fileTerms.push({
        term: termInfo.term,
        occurrences: termInfo.occurrences,
        contexts: termInfo.contexts,
        sources: Array.from(termInfo.sources)
      });
    });
    
    // 缓存结果
    if (useCache) {
      const cacheKey = `file_${file}_${fs.statSync(file).mtimeMs}`;
      setCache(cacheKey, fileTerms);
    }
    
    return fileTerms;
  } catch (error) {
    console.error(`Error processing file ${relativePath}:`, error.message);
    return [];
  }
}

async function processLocalRepo(repoPath, filePatterns, options = {}) {
  const { useCache = false, concurrency = CONCURRENCY_LIMIT } = options;
  
  console.log(`Processing local repo at: ${repoPath}`);
  console.log(`Options: cache=${useCache}, concurrency=${concurrency}`);
  
  try {
    // 尝试从缓存获取整个仓库的结果
    if (useCache) {
      const repoStats = fs.statSync(repoPath);
      const cacheKey = `repo_${repoPath}_${filePatterns.join(',')}_${repoStats.mtimeMs}`;
      const cachedResult = getCache(cacheKey);
      
      if (cachedResult) {
        console.log(`[CACHE HIT] Entire repository processed`);
        // 重新计算统计信息
        const stats = {
          technical: 0,
          domain_specific: 0,
          common: 0
        };
        
        cachedResult.forEach(term => {
          stats[term.category]++;
        });
        
        console.log('Term statistics:');
        console.log(`- Technical terms: ${stats.technical}`);
        console.log(`- Domain specific terms: ${stats.domain_specific}`);
        console.log(`- Common terms: ${stats.common}`);
        
        return cachedResult;
      }
    }
    
    const files = extractFilesFromLocalRepo(repoPath, filePatterns);
    console.log(`Found ${files.length} files matching patterns: ${filePatterns.join(', ')}`);
    
    // 准备文件处理队列
    const fileInfos = files.map(file => ({
      file,
      repoPath,
      useCache
    }));
    
    console.log(`Starting concurrent processing with ${concurrency} workers...`);
    const startTime = Date.now();
    
    // 使用并发控制处理文件
    const fileResults = await runWithConcurrencyLimit(
      fileInfos,
      concurrency,
      processFile
    );
    
    const endTime = Date.now();
    console.log(`Finished concurrent processing in ${((endTime - startTime) / 1000).toFixed(2)} seconds`);
    
    // 合并所有文件的结果
    const termMap = new Map();
    
    fileResults.forEach(fileTerms => {
      for (const termInfo of fileTerms) {
        const key = termInfo.term.toLowerCase();
        
        if (!termMap.has(key)) {
          termMap.set(key, {
            term: termInfo.term,
            occurrences: 0,
            contexts: [],
            sources: new Set()
          });
        }
        
        const existing = termMap.get(key);
        existing.occurrences += termInfo.occurrences;
        existing.contexts = [...existing.contexts, ...termInfo.contexts].slice(0, 10);
        termInfo.sources.forEach(src => existing.sources.add(src));
      }
    });
    
    const finalTerms = finalizeTerms(termMap);
    console.log(`Finished processing ${files.length} files. Extracted ${finalTerms.length} unique terms.`);
    
    // 按分类统计
    const stats = {
      technical: 0,
      domain_specific: 0,
      common: 0
    };
    
    finalTerms.forEach(term => {
      stats[term.category]++;
    });
    
    console.log('Term statistics:');
    console.log(`- Technical terms: ${stats.technical}`);
    console.log(`- Domain specific terms: ${stats.domain_specific}`);
    console.log(`- Common terms: ${stats.common}`);
    
    // 缓存整个仓库的结果
    if (useCache) {
      const repoStats = fs.statSync(repoPath);
      const cacheKey = `repo_${repoPath}_${filePatterns.join(',')}_${repoStats.mtimeMs}`;
      setCache(cacheKey, finalTerms);
    }
    
    return finalTerms;
  } catch (error) {
    console.error(`Error processing local repo ${repoPath}:`, error.message);
    console.error(error.stack);
    // 返回已处理的部分结果作为降级方案
    return [];
  }
}

async function processRemoteRepo(ownerRepo, filePatterns, options = {}) {
  const { useCache = false } = options;
  
  console.log(`Processing remote repo: ${ownerRepo}`);
  console.log(`Options: cache=${useCache}`);
  
  try {
    // 尝试从缓存获取远程仓库结果
    if (useCache) {
      const cacheKey = `remote_${ownerRepo}_${filePatterns.join(',')}`;
      const cachedResult = getCache(cacheKey);
      
      if (cachedResult) {
        console.log(`[CACHE HIT] Remote repository processed`);
        // 重新计算统计信息
        const stats = {
          technical: 0,
          domain_specific: 0,
          common: 0
        };
        
        cachedResult.forEach(term => {
          stats[term.category]++;
        });
        
        console.log('Term statistics:');
        console.log(`- Technical terms: ${stats.technical}`);
        console.log(`- Domain specific terms: ${stats.domain_specific}`);
        console.log(`- Common terms: ${stats.common}`);
        
        return cachedResult;
      }
    }
    
    const [owner, repo] = ownerRepo.split('/');
    
    // 对于远程仓库，目前仍然只处理README
    // 完整实现需要使用GitHub API获取文件列表并下载
    let readmeContent;
    try {
      readmeContent = await fetchRawReadme(ownerRepo);
    } catch (fetchError) {
      console.error(`Error fetching README for ${ownerRepo}:`, fetchError.message);
      // 重试一次
      try {
        console.log('Retrying fetch...');
        readmeContent = await fetchRawReadme(ownerRepo);
      } catch (retryError) {
        console.error('Retry failed:', retryError.message);
        return [];
      }
    }
    
    if (!readmeContent) {
      console.log(`  README not found for ${ownerRepo}`);
      return [];
    }
    
    const termMap = new Map();
    
    // 从README内容提取术语（带上下文）
    const lines = readmeContent.split('\n');
    for (const line of lines) {
      if (line.trim()) {
        extractTermsWithMetadata(line, line, termMap);
      }
    }
    
    const finalTerms = finalizeTerms(termMap);
    console.log(`Extracted ${finalTerms.length} unique terms from README.md`);
    
    // 按分类统计
    const stats = {
      technical: 0,
      domain_specific: 0,
      common: 0
    };
    
    finalTerms.forEach(term => {
      stats[term.category]++;
    });
    
    console.log('Term statistics:');
    console.log(`- Technical terms: ${stats.technical}`);
    console.log(`- Domain specific terms: ${stats.domain_specific}`);
    console.log(`- Common terms: ${stats.common}`);
    
    // 缓存远程仓库结果
    if (useCache) {
      const cacheKey = `remote_${ownerRepo}_${filePatterns.join(',')}`;
      setCache(cacheKey, finalTerms);
    }
    
    return finalTerms;
  } catch (error) {
    console.error(`Error processing remote repo ${ownerRepo}:`, error.message);
    console.error(error.stack);
    return [];
  }
}

async function main() {
  try {
    // 解析命令行参数
    const args = process.argv.slice(2);
    const repos = [];
    let filePatterns = DEFAULT_FILE_PATTERNS;
    let useCache = false;
    let concurrency = CONCURRENCY_LIMIT;
    
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--files' && i + 1 < args.length) {
        filePatterns = args[i + 1].split(',').map(p => p.trim());
        i++; // 跳过模式值
      } else if (args[i] === '--cache') {
        useCache = true;
      } else if (args[i] === '--concurrency' && i + 1 < args.length) {
        const concurrencyValue = parseInt(args[i + 1], 10);
        if (!isNaN(concurrencyValue) && concurrencyValue > 0) {
          concurrency = concurrencyValue;
        }
        i++; // 跳过值
      } else {
        repos.push(args[i]);
      }
    }
    
    if (repos.length === 0) {
      console.log('Usage:');
      console.log('  node scripts/extract_terms.js [repo1 repo2 ...] [--files pattern] [--cache] [--concurrency 10]');
      console.log('');
      console.log('Examples:');
      console.log('  node scripts/extract_terms.js streetsidesoftware/vscode-spell-checker');
      console.log('  node scripts/extract_terms.js ./local/repo/path --files "**/*.ts,**/*.md"');
      console.log('  node scripts/extract_terms.js . --cache --concurrency 20');
      process.exit(1);
    }
    
    // 检查是否有glob依赖
    try {
      require('glob');
    } catch (e) {
      console.error('Error: glob dependency is required. Please install it with: npm install glob');
      process.exit(2);
    }
    
    // 创建缓存目录（如果启用缓存）
    if (useCache && !fs.existsSync(CACHE_DIR)) {
      try {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
        console.log(`Cache directory created: ${CACHE_DIR}`);
      } catch (error) {
        console.warn(`Failed to create cache directory: ${error.message}. Disabling cache.`);
        useCache = false;
      }
    }
    
    // 设置全局处理选项
    const processOptions = {
      useCache,
      concurrency
    };
    
    let allTerms = [];
    let termMap = new Map();
    
    console.log(`Processing ${repos.length} repositories with options: cache=${useCache}, concurrency=${concurrency}`);
    const startTime = Date.now();
    
    // 并发处理多个仓库
    const repoPromises = repos.map(async repo => {
      try {
        // 判断是本地路径还是远程仓库
        if (fs.existsSync(repo) && fs.statSync(repo).isDirectory()) {
          // 本地仓库
          return await processLocalRepo(repo, filePatterns, processOptions);
        } else {
          // 远程仓库
          return await processRemoteRepo(repo, filePatterns, processOptions);
        }
      } catch (error) {
        console.error(`Failed to process repository ${repo}:`, error.message);
        return [];
      }
    });
    
    // 等待所有仓库处理完成
    const repoResults = await Promise.allSettled(repoPromises);
    
    // 合并结果
    for (const result of repoResults) {
      if (result.status === 'fulfilled') {
        const terms = result.value;
        
        // 合并并去重术语（基于术语本身的文本）
        for (const termInfo of terms) {
          const key = termInfo.term.toLowerCase();
          
          if (!termMap.has(key)) {
            // 复制对象，避免引用问题
            termMap.set(key, {
              ...termInfo,
              sources: [...(termInfo.sources || [])],
              sampleContexts: [...(termInfo.sampleContexts || [])]
            });
          } else {
            // 合并来源和上下文
            const existing = termMap.get(key);
            if (termInfo.sources) {
              termInfo.sources.forEach(src => existing.sources.push(src));
            }
            if (termInfo.sampleContexts) {
              termInfo.sampleContexts.forEach(ctx => existing.sampleContexts.push(ctx));
            }
            
            // 合并出现次数
            existing.occurrences += termInfo.occurrences || 0;
            
            // 更新置信度（基于合并后的信息）
            existing.confidence = calculateConfidence(
              existing.term,
              (existing.sampleContexts || []).join(' '),
              existing.occurrences
            );
            existing.category = classifyTerm(existing.term, existing.confidence);
          }
        }
      } else {
        console.error(`Repository processing failed: ${result.reason?.message || 'Unknown error'}`);
      }
    }
    
    // 转换为数组并确保来源数组唯一
    allTerms = Array.from(termMap.values()).map(termInfo => ({
      ...termInfo,
      sources: [...new Set(termInfo.sources)].slice(0, 5), // 限制来源数量
      sampleContexts: (termInfo.sampleContexts || []).slice(0, 3) // 限制上下文数量
    }));
    
    // 重新排序
    allTerms.sort((a, b) => {
      if (a.confidence !== b.confidence) {
        return b.confidence - a.confidence;
      }
      return (b.occurrences || 0) - (a.occurrences || 0);
    });
    
    const endTime = Date.now();
    console.log(`Total processing time: ${((endTime - startTime) / 1000).toFixed(2)} seconds`);
    
    // 确保输出目录存在
    const outDir = path.join(__dirname, '..', 'generated');
    try {
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      
      // 保存结果
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outPath = path.join(outDir, `terms-${timestamp}.json`);
      const latestPath = path.join(outDir, 'terms.json');
      
      fs.writeFileSync(outPath, JSON.stringify(allTerms, null, 2), 'utf8');
      fs.writeFileSync(latestPath, JSON.stringify(allTerms, null, 2), 'utf8');
      
      console.log(`Total unique terms extracted: ${allTerms.length}`);
      console.log(`Results saved to: ${outPath}`);
      console.log(`Latest results also available at: ${latestPath}`);
    } catch (error) {
      console.error('Error saving results:', error.message);
      // 尝试保存到临时位置
      try {
        const tempPath = path.join(process.cwd(), `terms-result.json`);
        fs.writeFileSync(tempPath, JSON.stringify(allTerms, null, 2), 'utf8');
        console.log(`Results saved to fallback location: ${tempPath}`);
      } catch (tempError) {
        console.error('Failed to save results to fallback location:', tempError.message);
      }
    }
  } catch (error) {
    console.error('Unexpected error in main function:', error.message);
    console.error(error.stack);
    process.exit(3);
  }
}

main().catch(e => { 
  console.error('Error:', e); 
  process.exit(2); 
});
