import { describe, expect,test } from 'vitest';

import { damerauLevenshtein } from './damerau.js';

describe('damerau integration (simple suggestion ranking)', () => {
  test('rank simple candidates by damerau distance', () => {
    const input = 'ac';
    const candidates = ['ca', 'ac', 'cab'];
    const scored = candidates.map(w => ({ word: w, cost: damerauLevenshtein(input, w, 5) }));
    scored.sort((a, b) => {
      const ca = a.cost === Infinity ? Number.MAX_SAFE_INTEGER : a.cost;
      const cb = b.cost === Infinity ? Number.MAX_SAFE_INTEGER : b.cost;
      if (ca !== cb) return ca - cb;
      return a.word.localeCompare(b.word);
    });
    const ordered = scored.map(s => s.word);
    // Expect exact match first (cost 0), transposition next (cost 1), then insertion (cost >1)
    expect(ordered).toEqual(['ac', 'ca', 'cab']);
  });
});
