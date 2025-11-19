#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const inPath = path.join(__dirname, '..', 'generated', 'terms.json');
if (!fs.existsSync(inPath)) {
  console.error('Input terms.json not found at', inPath);
  process.exit(1);
}

const terms = JSON.parse(fs.readFileSync(inPath, 'utf8'));

// 关键词规则（小写），用于 whole-word 匹配
const rules = {
  frontend: [
    'html','css','javascript','typescript','react','vue','angular','dom','frontend','ui','ux','sass','less','scss','webpack','vite','esbuild','jsx','tsx'
  ],
  backend: [
    'server','api','database','db','sql','node','express','koa','backend','grpc','redis','postgres','mongodb','auth','middleware','lambda'
  ],
  ai: [
    'model','ml','ai','tensorflow','pytorch','neural','network','transformer','gpt','inference','embedding','nlp','llm'
  ]
};

// 简单停用词，避免误分类
const stopwords = new Set(['the','and','for','with','this','that','from','are','was','is','in','on','of','to','by','or','an','as','be','email','yaml']);

function normalize(term) {
  return String(term).trim();
}

function isNoise(term) {
  const t = term.toLowerCase();
  if (!t) return true;
  if (t.length < 3) return true;
  if (/@/.test(t)) return true; // emails
  if (/https?:\/\//.test(t)) return true; // urls
  if (/^[0-9]+$/.test(t)) return true; // pure numbers
  if (/^[0-9a-f]{6,}$/.test(t)) return true; // likely hashes
  if (stopwords.has(t)) return true;
  return false;
}

function buildTokenArray(term) {
  // 拆分成 token，按非字母数字下划线
  return term.split(/[^A-Za-z0-9]+/).filter(Boolean).map(s=>s.toLowerCase());
}

function classify(term) {
  const orig = normalize(term);
  const t = orig.toLowerCase();
  if (isNoise(t)) return { domain: 'other', score: 0 };

  const tokens = buildTokenArray(t);

  const scores = { frontend: 0, backend: 0, ai: 0 };
  for (const [domain, kws] of Object.entries(rules)) {
    for (const k of kws) {
      // whole-word match against tokens
      if (tokens.includes(k)) scores[domain] += 2; // stronger weight
      else {
        // substring match gives weaker signal
        for (const tk of tokens) {
          if (tk.includes(k)) { scores[domain] += 1; break; }
        }
      }
    }
  }

  // choose highest score if >0 and unique
  const entries = Object.entries(scores).sort((a,b)=>b[1]-a[1]);
  if (entries[0][1] === 0) return { domain: 'other', score: 0 };
  if (entries[0][1] === entries[1][1]) return { domain: 'other', score: entries[0][1] }; // tie -> other
  return { domain: entries[0][0], score: entries[0][1] };
}

const groups = { frontend: [], backend: [], ai: [], other: [] };
const confidence = {};

for (const term of terms) {
  const res = classify(term);
  groups[res.domain].push(term);
  confidence[term] = res.score;
}

const outDir = path.join(__dirname, '..', 'generated');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, 'terms-frontend.json'), JSON.stringify(groups.frontend.sort((a,b)=>a.localeCompare(b)), null, 2), 'utf8');
fs.writeFileSync(path.join(outDir, 'terms-backend.json'), JSON.stringify(groups.backend.sort((a,b)=>a.localeCompare(b)), null, 2), 'utf8');
fs.writeFileSync(path.join(outDir, 'terms-ai.json'), JSON.stringify(groups.ai.sort((a,b)=>a.localeCompare(b)), null, 2), 'utf8');
fs.writeFileSync(path.join(outDir, 'terms-other.json'), JSON.stringify(groups.other.sort((a,b)=>a.localeCompare(b)), null, 2), 'utf8');
fs.writeFileSync(path.join(outDir, 'terms-summary.json'), JSON.stringify({
  total: terms.length,
  frontend: groups.frontend.length,
  backend: groups.backend.length,
  ai: groups.ai.length,
  other: groups.other.length
}, null, 2), 'utf8');

fs.writeFileSync(path.join(outDir, 'terms-confidence.json'), JSON.stringify(confidence, null, 2), 'utf8');

console.log('Wrote classified terms to', outDir);
console.log('Summary:', fs.readFileSync(path.join(outDir, 'terms-summary.json'), 'utf8'));

// Print a small preview
function preview(name, arr) {
  console.log('\n== ' + name + ' (' + arr.length + ') ==');
  console.log(arr.slice(0, 40).join(', '));
}

preview('frontend', groups.frontend);
preview('backend', groups.backend);
preview('ai', groups.ai);
preview('other', groups.other);

process.exit(0);
