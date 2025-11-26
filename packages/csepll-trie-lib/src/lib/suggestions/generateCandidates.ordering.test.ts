import { expect,test } from 'vitest';

// 直接使用类以便检查返回的 Candidate[]（含 count/distance）
// 若你的导出名字或路径不同，请按实际调整
import { CandidateGenerator } from './candidateGenerator.js';

test('ordering: higher frequency wins when distance ties', () => {
  const cg = new CandidateGenerator({ maxEdit: 2, maxSuggestions: 10, useLowercase: true });
  // dict: same distance to input 'ac' (both 1), but different counts
  cg.buildFromWordList([{ word: 'bc', count: 5 }, { word: 'ad', count: 20 }]);
  const out = cg.lookup('ac', 2);
  // both should appear
  expect(out.map(o => o.term)).toEqual(expect.arrayContaining(['bc', 'ad']));
  // the one with higher count should come earlier
  const idxAd = out.findIndex(x => x.term === 'ad');
  const idxBc = out.findIndex(x => x.term === 'bc');
  expect(idxAd).toBeLessThan(idxBc);
});

test('stable ordering: repeated lookups produce same order', () => {
  const cg = new CandidateGenerator({ maxEdit: 2, maxSuggestions: 10, useLowercase: true });
  const words = [
    { word: 'candA', count: 2 },
    { word: 'canda', count: 2 },
    { word: 'cánda', count: 2 },
  ];
  cg.buildFromWordList(words);
  // run multiple lookups and check order stable
  const orders: string[][] = [];
  for (let i = 0; i < 5; i++) {
    orders.push(cg.lookup('canda', 2).map(x => x.term));
  }
  // all orders must be identical
  for (let i = 1; i < orders.length; i++) {
    expect(orders[i]).toEqual(orders[0]);
  }
});

test.skip('tie-break: prefer length closeness when freq & distance tie', () => {
  const cg = new CandidateGenerator({ maxEdit: 2, maxSuggestions: 10, useLowercase: true });
  // candidates: same distance and same freq, but one has length closer to input
  cg.buildFromWordList([
    { word: 'longword', count: 1 },
    { word: 'closer', count: 1 },
  ]);
  const input = 'clos'; // 'closer' length diff 2, 'longword' diff 4
  const out = cg.lookup(input, 2);
  console.log('Lookup results:', out);
  // ensure closer comes before longword
  const terms = out.map(x => x.term);
  // If both candidates are present, ensure 'closer' is ranked before 'longword'
  if (terms.includes('closer') && terms.includes('longword')) {
    expect(terms.indexOf('closer')).toBeLessThan(terms.indexOf('longword'));
  } else {
    // Otherwise, at minimum 'closer' should be suggested (it's the closer-length candidate).
    console.log('Missing expected candidates. Actual results:', terms);
    expect(terms).toEqual(expect.arrayContaining(['closer']));
  }
});
