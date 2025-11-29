// damerauRerank.ts
import { damerauLevenshtein } from '../distance/damerau.js';
// 小型 normalize helper — 与你项目里 normalize 保持一致（NFC + lowercase）
function norm(s: string) {
  return (s ?? '').normalize('NFC').toLowerCase();
}

export type RerankOptions = {
  maxDistance?: number; // 传给 damerau 函数的距离上限（可选）
  topK?: number;        // 最终返回的候选数量（可选）
};

/**
 * 用 Damerau 距离对候选列表重新排序（距离越小越好）。
 * - candidates: string[] （原始词形）
 * - 返回：按 cost 升序排列的 string[]
 */
export function rerankCandidatesByDamerau(input: string, candidates: string[], opts: RerankOptions = {}): string[] {
  const maxDistance = opts.maxDistance ?? Infinity;
  const scores = candidates.map((c) => {
    const cost = (() => {
      try {
        return damerauLevenshtein(norm(input), norm(c), maxDistance);
      } catch {
        return Infinity;
      }
    })();
    return { word: c, cost: cost === undefined ? Infinity : cost };
  });

  scores.sort((a, b) => {
    if (a.cost !== b.cost) {
      // Infinity will float to the end
      if (a.cost === Infinity) return 1;
      if (b.cost === Infinity) return -1;
      return a.cost - b.cost;
    }
    // For words with same cost, prioritize transpositions over insertions/deletions
    const isTransA = a.word.length === input.length && a.word !== input;
    const isTransB = b.word.length === input.length && b.word !== input;
    if (isTransA && !isTransB) return -1;
    if (!isTransA && isTransB) return 1;
    
    // tie-break: shorter length difference then lexicographic (stable-ish)
    const la = Math.abs(a.word.length - input.length);
    const lb = Math.abs(b.word.length - input.length);
    if (la !== lb) return la - lb;
    return a.word.localeCompare(b.word);
  });

  const topK = opts.topK ?? scores.length;
  return scores
    .filter(s => s.cost <= (opts.maxDistance ?? Infinity))
    .slice(0, topK)
    .map(s => s.word);
}
