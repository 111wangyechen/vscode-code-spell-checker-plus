import { expect,test } from 'vitest';

// adapt this import to the module / function name you implement
import { generateCandidates } from './candidateGenerator.js'; // <-- 替换为你实际模块路径

test('generateCandidates: simple dict returns expected candidates', () => {
  const dict = ['resume', 'résumé', 'rescue', 'resumption'];
  const res = generateCandidates('résume', dict, { maxDistance: 2, maxSuggestions: 5 });
  // 至少应包含这几个正确候选（不关心顺序）
  expect(res).toEqual(expect.arrayContaining(['resume', 'résumé']));
});

test('generateCandidates: length prefilter works', () => {
  const dict = ['a','ab','abc','abcd','abcde'];
  const res = generateCandidates('abc', dict, { maxDistance: 1 });
  // 过长或过短被过滤掉（依照你实现的长度策略）
  expect(res.every((w: string | any[]) => Math.abs(w.length - 'abc'.length) <= 1)).toBe(true);
});
