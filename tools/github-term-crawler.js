#!/usr/bin/env node

/**
 * GitHub Top1000项目爬取工具
 * 用于提取高频技术术语并构建领域分类词库
 */

import axios from 'axios';
import { existsSync,mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// 定义领域类型
const DOMAINS = ['frontend', 'backend', 'ai'];

// 定义领域关键词
const DOMAIN_KEYWORDS = {
  frontend: ['react', 'vue', 'angular', 'javascript', 'typescript', 'html', 'css', 'next.js', 'vite', 'webpack'],
  backend: ['node.js', 'python', 'java', 'go', 'spring', 'django', 'flask', 'express', 'nestjs', 'laravel'],
  ai: ['tensorflow', 'pytorch', 'machine learning', 'deep learning', 'ai', 'neural network', 'nlp', 'computer vision', 'ml', 'dl']
};

// GitHub API 配置
const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // 建议使用环境变量存储
const MAX_PROJECTS = 1000;
const TERMS_PER_PROJECT = 50; // 每个项目提取的术语数

if (!GITHUB_TOKEN) {
  console.warn('警告: 未设置 GITHUB_TOKEN 环境变量，可能会受到 GitHub API 速率限制');
}



// 调试设置
const DEBUG = true;
const DEBUG_MAX_PROJECTS = 10; // 调试时只爬取10个项目

// 创建输出目录
const OUTPUT_DIR = join(process.cwd(), 'tech-terms');
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * 爬取GitHub Top1000项目
 */
async function fetchTopGitHubProjects() {
  const projects = [];
  let page = 1;
  const maxProjects = DEBUG ? DEBUG_MAX_PROJECTS : MAX_PROJECTS;
  
  console.log(`开始爬取GitHub Top${maxProjects}项目...`);
  
  while (projects.length < maxProjects) {
    try {
      console.log(`正在请求第 ${page} 页项目...`);
      const response = await axios.get(`${GITHUB_API_BASE}/search/repositories`, {
        headers: {
          'Authorization': GITHUB_TOKEN ? `token ${GITHUB_TOKEN}` : undefined,
          'Accept': 'application/vnd.github.v3+json'
        },
        params: {
          q: 'stars:>10000',
          sort: 'stars',
          order: 'desc',
          per_page: Math.min(100, maxProjects - projects.length),
          page: page
        }
      });
      
      console.log(`成功获取第 ${page} 页，状态码: ${response.status}`);
      const items = response.data.items;
      if (items.length === 0) {
        console.log('没有更多项目了');
        break;
      }
      
      for (const item of items) {
        if (projects.length >= maxProjects) break;
        
        // 确定项目领域
        const domain = determineProjectDomain(item.description, item.topics);
        if (!domain) continue; // 跳过无法分类的项目
        
        projects.push({
          name: item.name,
          url: item.html_url,
          description: item.description,
          stars: item.stargazers_count,
          domain: domain
        });
      }
      
      console.log(`已爬取 ${projects.length}/${maxProjects} 个项目`);
      page++;
      
      // 避免触发GitHub API速率限制
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('爬取项目时出错:', error);
      break;
    }
  }
  
  return projects;
}

/**
 * 确定项目领域
 */
function determineProjectDomain(description, topics) {
  const text = (description || '').toLowerCase() + ' ' + topics.join(' ').toLowerCase();
  
  // 统计每个领域的匹配关键词数量
  const domainScores = {
    frontend: 0,
    backend: 0,
    ai: 0
  };
  
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          domainScores[domain]++;
        }
      }
    }
  
  // 选择得分最高的领域
  let maxScore = 0;
  let selectedDomain = null;
  
  for (const [domain, score] of Object.entries(domainScores)) {
    if (score > maxScore) {
      maxScore = score;
      selectedDomain = domain;
    }
  }
  
  return maxScore > 0 ? selectedDomain : null;
}

/**
 * 从项目中提取技术术语
 */
async function extractTechTermsFromProject(project) {
  try {
    // 获取项目的README内容
    const readmeResponse = await axios.get(`${GITHUB_API_BASE}/repos/${project.name}/readme`, {
      headers: {
        'Authorization': GITHUB_TOKEN ? `token ${GITHUB_TOKEN}` : undefined,
        'Accept': 'application/vnd.github.v3.raw'
      }
    });
    
    const readmeContent = readmeResponse.data;
    
    // 简单的术语提取逻辑
    // 这里可以根据需要扩展更复杂的提取算法
    const terms = extractTerms(readmeContent);
    
    return terms.slice(0, TERMS_PER_PROJECT);
  } catch (error) {
    console.error(`提取项目 ${project.name} 术语时出错:`, error);
    return [];
  }
}

/**
 * 从文本中提取术语
 */
function extractTerms(text) {
  // 提取可能的技术术语
  // 这个正则表达式会匹配驼峰式、下划线式和连字符式的术语
  const termRegex = /\b([A-Z][a-z]+(?:[A-Z][a-z]+)+|\b[a-z]+(?:-[a-z]+)+|\b[a-z]+(?:_[a-z]+)+|\b[A-Z]{2,}\b)\b/g;
  
  const matches = text.match(termRegex);
  if (!matches) return [];
  
  // 统计术语出现频率
  const termCounts = {};
  for (const match of matches) {
    const term = match.toLowerCase();
    termCounts[term] = (termCounts[term] || 0) + 1;
  }
  
  // 按频率排序并返回
  return Object.entries(termCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([term]) => term);
}

/**
 * 构建技术术语词库
 */
async function buildTechTermsDictionary() {
  console.log('开始构建技术术语词库...');
  
  // 1. 爬取项目
  const projects = await fetchTopGitHubProjects();
  console.log(`成功爬取 ${projects.length} 个项目`);
  
  // 2. 提取术语
  const allTerms = [];
  const termMap = {};
  
  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    console.log(`正在处理项目 ${i + 1}/${projects.length}: ${project.name}`);
    
    const terms = await extractTechTermsFromProject(project);
    
    // 更新术语统计
    for (const term of terms) {
      if (!termMap[term]) {
        termMap[term] = {
          term,
          count: 0,
          domains: []
        };
      }
      
      termMap[term].count++;
      if (!termMap[term].domains.includes(project.domain)) {
        termMap[term].domains.push(project.domain);
      }
    }
  }
  
  // 转换为数组并按频率排序
  const sortedTerms = Object.values(termMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5000); // 限制总术语数
  
  console.log(`成功提取 ${sortedTerms.length} 个技术术语`);
  
  // 3. 按领域分类保存
  for (const domain of Object.keys(DOMAIN_KEYWORDS)) {
    const domainTerms = sortedTerms
      .filter(term => term.domains.includes(domain))
      .map(term => term.term);
    
    const outputPath = join(OUTPUT_DIR, `${domain}-terms.txt`);
    writeFileSync(outputPath, domainTerms.join('\n'), 'utf8');
    
    console.log(`已保存 ${domain} 领域术语 ${domainTerms.length} 个到 ${outputPath}`);
  }
  
  // 4. 保存所有术语
  const allTermsPath = join(OUTPUT_DIR, 'all-terms.txt');
  writeFileSync(allTermsPath, sortedTerms.map(term => term.term).join('\n'), 'utf8');
  
  console.log('术语词库构建完成！');
}

// 运行爬取工具
if (import.meta.url.endsWith(process.argv[1])) {
  buildTechTermsDictionary().catch(console.error);
}