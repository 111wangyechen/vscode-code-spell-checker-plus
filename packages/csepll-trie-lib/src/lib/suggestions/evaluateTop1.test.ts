// evaluateTop1.test.ts
import fs from 'node:fs';
import path from 'node:path';

import { test } from 'vitest';

import { suggestWithOptionalRerank } from './suggestWithRerank.js';

type Pair = { input: string; correct: string };

function loadDataset(p: string): Pair[] {
  if (!fs.existsSync(p)) {
    console.error('Dataset not found:', p);
    return [];
  }
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw) as Pair[];
}

function printStats(total: number, top1: number, top3: number, top5: number) {
  const p1 = top1 / total;
  const p3 = top3 / total;
  const p5 = top5 / total;
  function ci95(p: number, n: number) {
    const se = Math.sqrt(p * (1 - p) / n);
    return [Math.max(0, p - 1.96 * se), Math.min(1, p + 1.96 * se)];
  }
  console.log('Total samples:', total);
  console.log(`Top-1: ${(p1*100).toFixed(2)}%  95% CI: [${(ci95(p1,total)[0]*100).toFixed(2)}%, ${(ci95(p1,total)[1]*100).toFixed(2)}%]`);
  console.log(`Top-3: ${(p3*100).toFixed(2)}%`);
  console.log(`Top-5: ${(p5*100).toFixed(2)}%`);
}

test('evaluate Top-1/3/5 on dataset (informational)', () => {
  const datasetPath = path.resolve(__dirname, '../../perf/top1_dataset.json'); // put your dataset here
  const dataset = loadDataset(datasetPath);
  if (!dataset || dataset.length === 0) {
    console.warn('No evaluation dataset found at', datasetPath);
    return;
  }

  let top1 = 0, top3 = 0, top5 = 0;
  for (const { input, correct } of dataset) {
    // call suggestion pipeline with rerank enabled (adjust opts if you want to test no-rerank)
    const suggestions = suggestWithOptionalRerank(input, (dataset as any).dict ?? dataset.map(d => d.correct), { numSuggestions: 5, rerank: 'damerau', rerankTopK: 100 });
    // suggestions is an array of strings
    if (!suggestions || suggestions.length === 0) continue;
    if (suggestions[0] === correct) top1++;
    if (suggestions.slice(0,3).includes(correct)) top3++;
    if (suggestions.slice(0,5).includes(correct)) top5++;
  }

  const total = dataset.length;
  printStats(total, top1, top3, top5);

  // If you want an automatic check: set env var EVAL_ASSERT=1 to enable assertion for Top-1 >= 0.8
  if (process.env.EVAL_ASSERT === '1') {
    const p1 = top1 / Math.max(1, total);
    if (p1 < 0.8) {
      throw new Error(`Top-1 below threshold: ${(p1*100).toFixed(2)}% < 80%`);
    }
  }
});
