import { describe, expect,test } from 'vitest';

import { damerauLevenshtein } from './damerau.js';
import { editDistance } from './distance.js'; // 项目现有的编辑距离实现

const pairs: Array<[string, string]> = [
  ['example', 'example'],
  ['kitten', 'sitting'],
  ['kitten', 'sitten'],
  ['ca', 'ac'],
  ['abcd', 'abdc'],
  ['abc', 'abxc'],
  ['cafe', 'café'],
  ['resume', 'résumé'],
  ['a', ''], ['','a'],
  ['longstringlongstring', 'longstringlongstrung'],
];

describe('compare damerau vs project editDistance (consistency)', () => {
  test('basic pairs produce reasonable values', () => {
    for (const [a, b] of pairs) {
      const dD = damerauLevenshtein(a, b, Infinity);
      const dE = editDistance(a, b, Infinity);
      // 两种算法在语义上可能不同（Damerau 支持邻位换位），这里只检查非负且数字或 Infinity
      expect([dD, dE].every(v => typeof v === 'number' || v === Infinity)).toBe(true);
      expect(dD === Infinity ? true : dD >= 0).toBe(true);
      expect(dE === Infinity ? true : dE >= 0).toBe(true);
    }
  });

  test('damerau returns 1 for simple transpositions', () => {
    expect(damerauLevenshtein('ca', 'ac')).toBe(1);
    expect(damerauLevenshtein('abcd', 'abdc')).toBe(1);
  });
});

// 简单的微基准（只是打印，不断言）
describe.skip('micro-benchmark (informational)', () => {
  test.skip('benchmark many random short strings (prints timings)', () => {
    const rnd = (n = 5) => Array.from({ length: n }, () => Math.random().toString(36).slice(2, 8)).join('');
    const N = 1000;
    const inputs: Array<[string, string]> = [];
    for (let i = 0; i < N; i++) inputs.push([rnd(), rnd()]);

    const t0 = Date.now();
    for (const [a, b] of inputs) damerauLevenshtein(a, b, 5);
    const t1 = Date.now();

    const t2 = Date.now();
    for (const [a, b] of inputs) editDistance(a, b, 5);
    const t3 = Date.now();

    // 输出供人工观察
    // vitest 会显示 console.log
    console.log(`damerau time: ${t1 - t0} ms, editDistance time: ${t3 - t2} ms, N=${N}`);
    expect(true).toBe(true);
  });
});
