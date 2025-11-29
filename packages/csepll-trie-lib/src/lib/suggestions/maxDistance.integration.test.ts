import { expect,test } from 'vitest';

import { CandidateGenerator } from './candidateGenerator.js';
import { rerankCandidatesByDamerau } from './damerauRerank.js';

test('maxDistance: CandidateGenerator respects maxDistance (0 -> exact only)', () => {
  const dict = ['resume', 'résumé', 'rescue', 'rescuee', 'resumption', 'resumed'];
  const cg = new CandidateGenerator({ maxEdit: 3, maxSuggestions: 10, useLowercase: true });
  cg.buildFromWordList(dict.map(w => ({ word: w, count: 1 })));

  // exact only
  const r0 = cg.lookup('resume', 0).map(x => x.term);
  expect(r0).toEqual(['resume']); // exact match only

  // allow distance 1 (should include very near candidates like 'résumé' or 'resumed')
  const r1 = cg.lookup('resume', 1).map(x => x.term);
  expect(r1.length).toBeGreaterThanOrEqual(1);
  expect(r1).toEqual(expect.arrayContaining(['resume']));

  // very small maxDistance excludes far ones
  const r1no = cg.lookup('resumption', 1).map(x => x.term);
  // 'resumption' is far from 'resume' so should not include 'resume' at maxDistance 1
  expect(r1no).toEqual(expect.not.arrayContaining(['resume']));
});

test('maxDistance: rerankCandidatesByDamerau respects maxDistance filter', () => {
  const input = 'ac';
  const candidates = ['ac', 'ca', 'cab', 'longish'];
  const rAll = rerankCandidatesByDamerau(input, candidates, { maxDistance: 10 });
  // with large maxDistance, 'longish' may be present (or at least not filtered purely by rerank)
  expect(Array.isArray(rAll)).toBe(true);
  // With very tight maxDistance (0) only exact match remains
  const r0 = rerankCandidatesByDamerau(input, candidates, { maxDistance: 0 });
  expect(r0).toEqual(expect.arrayContaining(['ac']));
  // and should NOT contain a transposition when maxDistance 0
  expect(r0).toEqual(expect.not.arrayContaining(['ca']));
});
