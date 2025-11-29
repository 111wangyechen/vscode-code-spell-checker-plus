/* damerau.randomized.test.ts
   Randomized / property-style tests for damerau rerank & distance.
*/
import { expect,test } from 'vitest';

import { rerankCandidatesByDamerau } from '../suggestions/damerauRerank.js';
import { damerauLevenshtein } from './damerau.js';

// small helper RNG (non-seeded, quick)
function randInt(n: number) { return Math.floor(Math.random() * n); }
const alphabet = ['a','b','c','d','e','é','i','o']; // include a diacritic to stress folding

function randWord(minLen = 1, maxLen = 6) {
  const L = minLen + randInt(maxLen - minLen + 1);
  let s = '';
  for (let i = 0; i < L; i++) s += alphabet[randInt(alphabet.length)];
  return s;
}

// mutate a word with a small random edit (insert/delete/substitute/transpose)
function mutate(word: string) {
  if (word.length === 0) return randWord();
  const op = randInt(4);
  const i = randInt(word.length);
  switch (op) {
    case 0: { // delete
      return word.slice(0,i) + word.slice(i+1);
    }
    case 1: { // insert
      return word.slice(0,i) + alphabet[randInt(alphabet.length)] + word.slice(i);
    }
    case 2: { // substitute
      return word.slice(0,i) + alphabet[randInt(alphabet.length)] + word.slice(i+1);
    }
    case 3: // transpose (if possible)
      { if (word.length === 1) return word + alphabet[randInt(alphabet.length)];
      const j = Math.min(word.length-1, i+1);
      const arr = [...word];
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
      return arr.join(''); }
    default: {
      return word;
    }
  }
}

test('randomized: rerank is subset, deterministic, and distances valid', () => {
  const iterations = 200;
  for (let it = 0; it < iterations; it++) {
    const input = randWord(1,6);
    // build candidate set: some mutated forms + some random noise
    const baseCount = 12 + randInt(18); // 12..29 candidates
    const candidates = new Set<string>();
    // ensure at least one exact candidate maybe included
    if (Math.random() < 0.7) candidates.add(input);
    for (let i = 0; i < baseCount; i++) {
      const w = Math.random() < 0.6 ? mutate(input) : randWord(1,8);
      candidates.add(w);
      if (candidates.size >= 60) break;
    }
    const candArr = [...candidates];

    // property 1: rerank output is subset of input candidates
    const out1 = rerankCandidatesByDamerau(input, candArr, { maxDistance: 5, topK: 20 });
    expect(out1.every(w => candArr.includes(w))).toBe(true);

    // property 2: deterministic within same run
    const out2 = rerankCandidatesByDamerau(input, candArr, { maxDistance: 5, topK: 20 });
    expect(out1).toEqual(out2);

    // property 3: damerauLevenshtein returns valid numbers (or Infinity) for every pair tested
    for (let i = 0; i < Math.min(10, candArr.length); i++) {
      const w = candArr[i];
      const d = damerauLevenshtein(input, w, 10);
      const ok = (d === Infinity) || (typeof d === 'number' && Number.isFinite(d) && d >= 0);
      expect(ok).toBe(true);
    }

    // property 4: when maxDistance is 0, only exact matches allowed
    const out0 = rerankCandidatesByDamerau(input, candArr, { maxDistance: 0, topK: 20 });
    // out0 should contain only items equal to input (or be empty)
    expect(out0.every(w => w === input)).toBe(true);
  }
});
