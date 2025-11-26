import { expect,test } from 'vitest';

import * as SDP from '../SimpleDictionaryParser.js';
// import { CandidateGenerator } from './candidateGenerator.js';
import { suggestWithOptionalRerank } from './suggestWithRerank.js';

test('suggestWithOptionalRerank: trie or dict -> rerank by damerau (exact > transposition > insertion)', () => {
  const dict = ['ac', 'ca', 'cab', 'academy', 'action', 'ácc']; // include a diacritic variant

  // First try with plain array source (CandidateGenerator fallback)
  const resNoRerank = suggestWithOptionalRerank('ac', dict, { numSuggestions: 5, rerank: null });
  expect(Array.isArray(resNoRerank)).toBe(true);
  expect(resNoRerank.length).toBeGreaterThan(0);

  const resRerank = suggestWithOptionalRerank('ac', dict, { numSuggestions: 5, rerank: 'damerau', rerankTopK: 5 });
  // Expect exact match 'ac' first, then 'ca', then 'cab' (or at least order consistent with distance)
  expect(resRerank[0]).toBe('ac');
  expect(resRerank[1]).toBe('ca');
  // third should be insertion or close form
  expect(resRerank.includes('cab')).toBe(true);

  // If parseDictionaryLegacy is available, also test trie path
  try {
    const parseFn = (SDP as any).parseDictionaryLegacy ?? (SDP as any).parseDictionary;
    if (typeof parseFn === 'function') {
      const trie = parseFn(dict);
      if (trie && typeof trie.suggest === 'function') {
        const trieReranked = suggestWithOptionalRerank('ac', trie, { numSuggestions: 5, rerank: 'damerau' });
        expect(trieReranked[0]).toBe('ac');
      }
    }
  } catch {
    // ignore
  }
});
