import { expect,test } from 'vitest';

import { rerankCandidatesByDamerau } from './damerauRerank.js';

test('damerau rerank: prefer exact match then transposition then insertion', () => {
  const input = 'ac';
  const candidates = ['ca', 'ac', 'cab'];
  const ranked = rerankCandidatesByDamerau(input, candidates, { maxDistance: 5, topK: 10 });
  expect(ranked[0]).toBe('ac'); // exact
  expect(ranked[1]).toBe('ca'); // transposition (distance 1)
  expect(ranked[2]).toBe('cab'); // insertion
});
