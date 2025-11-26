import { expect,test } from 'vitest';

// Try to import parseDictionaryLegacy; if your repo exposes it differently adjust the path.
import * as SDP from '../SimpleDictionaryParser.js';
import { CandidateGenerator } from './candidateGenerator.js';

test('trie + small wordlist integration: trie.suggest (if available) and CandidateGenerator overlap', () => {
  const dict = ['resume', 'résumé', 'rescue', 'resumption', 'rescuee'];
  // 1) Try to build trie via parseDictionaryLegacy if available
  let trieSuggestions: string[] = [];
  let trieAvailable = false;
  try {
    const parseFn = (SDP as any).parseDictionaryLegacy ?? (SDP as any).parseDictionary;
    if (typeof parseFn === 'function') {
      // Many repo helper parsers accept either an array or a string; try array first.
      const trie = parseFn(dict);
      if (trie && typeof trie.suggest === 'function') {
        trieAvailable = true;
        const s = trie.suggest('resume', { numSuggestions: 6 });
        trieSuggestions = Array.isArray(s) ? s : (s || []).map((x: any) => (typeof x === 'string' ? x : x.word ?? x.wordAdjustedToMatchCase ?? String(x)));
      }
    }
  } catch {
    // ignore: we'll validate using CandidateGenerator below
  }

  // 2) Build CandidateGenerator and get suggestions
  const cg = new CandidateGenerator({ maxEdit: 2, maxSuggestions: 8, useLowercase: true });
  cg.buildFromWordList(dict.map(w => ({ word: w, count: 1 })));
  const cgRes = cg.lookup('resume');
  const cgSuggestions = cgRes.map(r => r.term);

  // 3) Assertions:
  // - CandidateGenerator should return something reasonable (non-empty)
  expect(Array.isArray(cgSuggestions)).toBe(true);
  expect(cgSuggestions.length).toBeGreaterThan(0);

  if (trieAvailable) {
    // If trie was available, require at least one overlapping suggestion
    const overlap = trieSuggestions.filter(s => cgSuggestions.includes(s));
    expect(overlap.length).toBeGreaterThan(0);
  } else {
    // If trie not available, at minimum ensure CandidateGenerator returns 'resume' or 'résumé'
    expect(cgSuggestions).toEqual(expect.arrayContaining(['resume', 'résumé']));
  }
});
