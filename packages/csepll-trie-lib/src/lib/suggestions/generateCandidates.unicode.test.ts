import { expect,test } from 'vitest';

import { generateCandidates } from './candidateGenerator.js'; // 你之前做的导出

test('normalization NFC vs NFD: decomposed equals composed', () => {
  const a = 'café';               // composed (NFC)
  const b = 'cafe\u0301';        // decomposed (NFD)
  expect(a.normalize('NFC')).toBe(b.normalize('NFC'));

  const dict = ['café', 'cafe'];
  const resA = generateCandidates(a, dict, { maxDistance: 1, maxSuggestions: 5 });
  const resB = generateCandidates(b, dict, { maxDistance: 1, maxSuggestions: 5 });

  // 两种输入应至少能找到 'café' 或 'cafe' 中的一个（取决你实现的优先级），但不能是空
  expect(resA.length).toBeGreaterThan(0);
  expect(resB.length).toBeGreaterThan(0);
  // 至少包含 'café' 或 'cafe'
  expect(resA).toEqual(expect.arrayContaining(['café', 'cafe']));
  expect(resB).toEqual(expect.arrayContaining(['café', 'cafe']));
});

test('combining diacritics separated: input with combining mark matches composed dictionary', () => {
  const input = 'e\u0301'; // 'e' + combining acute
  const dict = ['é', 'e'];
  const res = generateCandidates(input, dict, { maxDistance: 1, maxSuggestions: 5 });
  expect(res.length).toBeGreaterThan(0);
  expect(res).toEqual(expect.arrayContaining(['é', 'e']));
});

test('accent-only difference: plain vs accented', () => {
  const dict = ['resume', 'résumé'];
  // input without accents should still retrieve accented candidate if within distance
  const res1 = generateCandidates('resume', dict, { maxDistance: 2, maxSuggestions: 5 });
  expect(res1).toEqual(expect.arrayContaining(['resume', 'résumé']));

  // input with accents should also match plain
  const res2 = generateCandidates('résumé', dict, { maxDistance: 2, maxSuggestions: 5 });
  expect(res2).toEqual(expect.arrayContaining(['resume', 'résumé']));
});

test('case + diacritics: uppercase/lowercase interplay', () => {
  const dict = ['Café', 'café', 'Cafe', 'cafe'];
  const res = generateCandidates('CAFE', dict, { maxDistance: 2, maxSuggestions: 10, useLowercase: true });
  // with useLowercase true, suggestions should include lowercase/diacritic variants
  expect(res.length).toBeGreaterThan(0);
  expect(res).toEqual(expect.arrayContaining(['café', 'cafe', 'Café', 'Cafe']));
});

test('non-latin scripts: basic sanity (do not crash)', () => {
  const dict = ['東京', 'とうきょう', 'tokyo'];
  const res = generateCandidates('東京', dict, { maxDistance: 1, maxSuggestions: 5 });
  // We only assert it doesn't throw and returns array
  expect(Array.isArray(res)).toBe(true);
});
