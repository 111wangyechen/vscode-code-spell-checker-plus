#!/usr/bin/env node
// 简单的术语提取原型脚本
// 用法: node scripts/extract_terms.js [repo1 repo2 ...]
// repo 参数格式: owner/repo，如: streetsidesoftware/vscode-spell-checker

const fs = require('fs');
const path = require('path');

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

function extractWords(text) {
  // 简单分词：按非字母数字下划线分割
  const tokens = text.split(/[^\p{L}\p{N}_]+/u).filter(Boolean);
  const words = tokens
    .map(t => t.replace(/^_+|_+$/g, ''))
    .filter(t => t.length >= 3) // 长度门槛
    .map(t => t.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, ''))
    .filter(t => t.length >= 3);
  return words;
}

async function main() {
  const repos = process.argv.slice(2);
  if (repos.length === 0) {
    console.log('No repos provided. Example: node scripts/extract_terms.js streetsidesoftware/vscode-spell-checker');
    process.exit(1);
  }
  const result = new Set();
  for (const r of repos) {
    console.log('Fetching README for', r);
    const md = await fetchRawReadme(r);
    if (!md) {
      console.log('  README not found for', r);
      continue;
    }
    const words = extractWords(md);
    for (const w of words) result.add(w);
  }
  const out = Array.from(result).sort((a,b)=>a.localeCompare(b));
  const outDir = path.join(__dirname, '..', 'generated');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'terms.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
  console.log('Wrote', outPath, 'with', out.length, 'terms');
}

main().catch(e => { console.error(e); process.exit(2); });
