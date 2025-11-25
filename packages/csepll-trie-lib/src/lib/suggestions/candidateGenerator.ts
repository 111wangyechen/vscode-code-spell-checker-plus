/**
 * candidateGenerator.ts
 *
 * 候选词生成器（SymSpell 风格简化实现）
 *
 * 依赖：内置实现的 levenshteinDistance（带 maxDistance 带早停）
 *
 * 用法：
 *  const cg = new CandidateGenerator({ maxEdit: 2 });
 *  cg.buildFromWordList([{word:"the",count:1000}, ...]);
 *  const cands = cg.lookup("teh");
 */

type WordCount = { word: string; count?: number };
type Candidate = { term: string; distance: number; count: number };

export interface CandidateGeneratorOptions {
  maxEdit?: number;        // 最大编辑距离（用于 deletes 生成与查询上限）
  maxSuggestions?: number; // 返回候选数量上限
  useLowercase?: boolean;  // 是否把词转小写
  maxQueueSize?: number;   // 内部用于 BFS 生成 deletes 的限制（防爆）
  shortWordThreshold?: number; // 短词的距离阈值策略
}

function normalizeToken(s: string, toLower = true): string {
  if (!s) return s;
  // Only trim and lowercase, normalization is handled at higher level
  let t = s.trim();
  if (toLower) t = t.toLowerCase();
  return t;
}

// Remove diacritics / combining marks: normalize to NFD then strip marks then recompose (NFC)
function removeDiacritics(s: string): string {
  if (!s) return s;
  // decompose, remove combining marks, recompose
  return s.normalize('NFD').replaceAll(/\p{M}/gu, '').normalize('NFC');
}


// 带 maxDistance 的 Levenshtein（带早停，基于原回答的带宽DP实现）
export function levenshteinDistance(a: string, b: string, maxDistance: number = Infinity): number {
  // Normalize both strings to NFC for consistent comparison
  const aNorm = a.normalize('NFC');
  const bNorm = b.normalize('NFC');
  if (aNorm === bNorm) return 0;
  const n = aNorm.length, m = bNorm.length;
  if (Math.abs(n - m) > maxDistance) return Infinity;
  // 特殊处理：如果只有一个字符差异（如é vs e），直接返回距离1
  if (n === m && maxDistance >= 1) {
    let diff = 0;
    for (let i = 0; i < n; i++) {
      if (aNorm[i] !== bNorm[i]) diff++;
      if (diff > maxDistance) break;
    }
    if (diff <= maxDistance) return diff;
  }
  if (n > m) return levenshteinDistance(bNorm, aNorm, maxDistance);

  const prev = new Array(n + 1);
  const curr = new Array(n + 1);

  for (let i = 0; i <= n; i++) prev[i] = i;

  for (let j = 1; j <= m; j++) {
    curr[0] = j;
    const bj = bNorm.charAt(j - 1);

    const low = Math.max(1, j - maxDistance);
    const high = Math.min(n, j + maxDistance);

    if (low > 1) curr[low - 1] = Infinity;

    for (let i = low; i <= high; i++) {
      const cost = aNorm.charAt(i - 1) === bj ? 0 : 1;
      const insertion = curr[i - 1] + 1;
      const deletion = prev[i] + 1;
      const substitution = prev[i - 1] + cost;
      curr[i] = Math.min(insertion, deletion, substitution);
    }

    let minInRow = Infinity;
    for (let i = 0; i <= n; i++) {
      if (curr[i] < minInRow) minInRow = curr[i];
      prev[i] = curr[i];
    }
    if (minInRow > maxDistance) return Infinity;
  }
  return prev[n] <= maxDistance ? prev[n] : Infinity;
}

export class CandidateGenerator {
  private maxEdit: number;
  private maxSuggestions: number;
  private useLowercase: boolean;
  private maxQueueSize: number;
  private shortWordThreshold: number;

  // delete-form -> Set of original words — not required
  private deletes: Map<string, Set<string>> = new Map();
  // frequency map of original words — not required
  private freq: Map<string, number> = new Map();

  // simple LRU cache for recent lookup results
  private cache: Map<string, Candidate[]> = new Map();
  private cacheMaxEntries = 1000;

  constructor(opts?: CandidateGeneratorOptions) {
    this.maxEdit = opts?.maxEdit ?? 2;
    this.maxSuggestions = opts?.maxSuggestions ?? 8;
    this.useLowercase = opts?.useLowercase ?? true;
    this.maxQueueSize = opts?.maxQueueSize ?? 100_000; // guardrail
    this.shortWordThreshold = opts?.shortWordThreshold ?? 4;
  }

  // ----- building helpers -----
  // generate delete variants for a word using BFS up to maxEdit
  private generateDeletes(word: string): Set<string> {
    const results = new Set<string>();
    const queue: string[] = [word];
    const seen = new Set<string>([word]);

    for (let depth = 0; depth < this.maxEdit; depth++) {
      const nextQueue: string[] = [];
      for (const token of queue) {
        if (token.length === 0) continue;
        for (let i = 0; i < token.length; i++) {
          const del = token.slice(0, i) + token.slice(i + 1);
          if (!seen.has(del)) {
            seen.add(del);
            results.add(del);
            nextQueue.push(del);
            if (seen.size > this.maxQueueSize) {
              // safety guard: stop generating more (shouldn't happen normally)
              break;
            }
          }
        }
        if (seen.size > this.maxQueueSize) break;
      }
      if (seen.size > this.maxQueueSize) break;
      queue.length = 0;
      queue.push(...nextQueue);
      if (queue.length === 0) break;
    }
    return results;
  }

  // add one word to structures (keep original form in the value sets)
  addWord(word: string, count = 1): void {
    if (!word) return;
    // Normalize word to NFC first
    const original = word.normalize('NFC');
    this.freq.set(original, (this.freq.get(original) ?? 0) + (count ?? 1));

    // normalized key used for deletes map
    const key = normalizeToken(original, this.useLowercase);
    if (!this.deletes.has(key)) this.deletes.set(key, new Set());
    // store ORIGINAL word in the set so we can return original forms later
    this.deletes.get(key)!.add(original);

    // Also generate deletes for the normalized key, but map them to original word
    const variants = this.generateDeletes(key);
    for (const v of variants) {
      if (!this.deletes.has(v)) this.deletes.set(v, new Set());
      this.deletes.get(v)!.add(original);
    }

    // Also add folded (diacritic-removed) key mapping to help accent-insensitive matches
    const foldedKey = removeDiacritics(key);
    if (foldedKey !== key) {
      if (!this.deletes.has(foldedKey)) this.deletes.set(foldedKey, new Set());
      this.deletes.get(foldedKey)!.add(original);
    }

    // For words with accents, add a version without accents
    if (original !== removeDiacritics(original)) {
      const noAccent = removeDiacritics(original);
      const noAccentKey = normalizeToken(noAccent, this.useLowercase);
      if (!this.deletes.has(noAccentKey)) this.deletes.set(noAccentKey, new Set());
      this.deletes.get(noAccentKey)!.add(original);
    }
  }


  // build quickly from word list
  buildFromWordList(list: WordCount[]): void {
    for (const wc of list) {
      this.addWord(wc.word, wc.count ?? 1);
    }
    this.cache.clear();
  }

  // support serializing/deserializing the core maps (for packaging)
  exportIndex(): string {
    // convert deletes map sets to arrays for JSON
    const deletesObj: Record<string, string[]> = {};
    for (const [k, s] of this.deletes.entries()) deletesObj[k] = [...s];
    const freqObj: Record<string, number> = {};
    for (const [k, v] of this.freq.entries()) freqObj[k] = v;
    return JSON.stringify({ deletes: deletesObj, freq: freqObj });
  }

  importIndex(json: string): void {
    const obj = JSON.parse(json);
    this.deletes = new Map();
    for (const key of Object.keys(obj.deletes)) {
      this.deletes.set(key, new Set<string>(obj.deletes[key]));
    }
    this.freq = new Map();
    for (const key of Object.keys(obj.freq)) this.freq.set(key, obj.freq[key]);
    this.cache.clear();
  }

  // ----- lookup / candidate generation -----
  // heuristic to choose maxDistance depending on input length
  private getMaxDistanceForWord(word: string, requested?: number) {
    if (requested !== undefined) return requested;
    const L = word.length;
    if (L <= this.shortWordThreshold) return 1;
    if (L <= 8) return Math.min(2, this.maxEdit);
    return Math.min(3, this.maxEdit);
  }

  // split identifiers: camelCase, snake_case, kebab-case, dot, numbers
  // returns an array of tokens (keeps original token too)
  splitIdentifier(token: string): string[] {
    // e.g. "getUserID_v2" -> ["get", "User", "ID", "v2", "getUserID_v2"]
    if (!token) return [token];
    const parts: string[] = [];
    // split by separators
    for (const p of token.split(/[_\-.\s]+/g)) {
      if (!p) continue;
      // split camelCase boundaries
      const camel = p.replaceAll(/([a-z])([A-Z0-9])/g, '$1 $2').replaceAll(/([A-Z])([A-Z][a-z])/g, '$1 $2');
      for (const sub of camel.split(/\s+/)) {
        if (sub.length) parts.push(sub);
      }
    }
    // include original token as well
    parts.push(token);
    return parts.map(s => normalizeToken(s, this.useLowercase));
  }

  // main lookup: returns ranked candidates
  lookup(inputRaw: string, maxDistanceParam?: number): Candidate[] {
    const input = normalizeToken(inputRaw, this.useLowercase);
    if (!input) return [];

    // cache quick hit
    const cacheKey = `${input}|${maxDistanceParam ?? 'auto'}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      // move to front (LRU)
      this.cache.delete(cacheKey);
      this.cache.set(cacheKey, cached);
      return cached;
    }

    const tokens = this.splitIdentifier(input);
    tokens.sort((a, b) => b.length - a.length);

    const maxDistance = this.getMaxDistanceForWord(input, maxDistanceParam);

    const candidatesMap = new Map<string, number>(); // candidate(originalWord) -> bestEstimateDistance
    const seenQueue = new Set<string>([input]);
    const queue: string[] = [input];

    // generate deletes from input up to maxDistance (BFS)
    for (let depth = 0; depth < maxDistance; depth++) {
      const nextQueue: string[] = [];
      for (const token of queue) {
        const bucket = this.deletes.get(token);
        if (bucket) {
          for (const w of bucket) {
            // w is original word
            candidatesMap.set(w, Infinity);
          }
        }
        if (token.length === 0) continue;
        for (let i = 0; i < token.length; i++) {
          const del = token.slice(0, i) + token.slice(i + 1);
          if (!seenQueue.has(del)) {
            seenQueue.add(del);
            nextQueue.push(del);
          }
        }
        if (seenQueue.size > this.maxQueueSize) break;
      }
      if (seenQueue.size > this.maxQueueSize) break;
      queue.length = 0;
      queue.push(...nextQueue);
      if (queue.length === 0) break;
    }

    // Also check delete mappings for tokens from splitIdentifier (helps identifiers)
    for (const tok of tokens) {
      if (tok.length === 0) continue;
      const bucket = this.deletes.get(tok);
      if (bucket) for (const w of bucket) candidatesMap.set(w, Infinity);
    }

    // If no candidates found from delete-forms, fallback: maybe exact normalized match exists
    if (candidatesMap.size === 0) {
      const exactBucket = this.deletes.get(input);
      if (exactBucket) for (const w of exactBucket) candidatesMap.set(w, 0);
    }

    // Also check for accent-insensitive matches for normalized inputs
    if (candidatesMap.size > 0) {
      const inputFold = removeDiacritics(input);
      if (inputFold !== input) {
        const foldedBucket = this.deletes.get(inputFold);
        if (foldedBucket) {
          for (const w of foldedBucket) {
            if (!candidatesMap.has(w)) {
              candidatesMap.set(w, Infinity);
            }
          }
        }
      }
    }

    // verify candidates with exact edit distance (bounded)
    const results: Candidate[] = [];
    for (const candOriginal of candidatesMap.keys()) {
      const candNorm = normalizeToken(candOriginal, this.useLowercase);
      const dist = levenshteinDistance(input, candNorm, maxDistance);
      if (dist !== Infinity) {
        results.push({ term: candOriginal, distance: dist, count: this.freq.get(candOriginal) ?? 1 });
      }
    }

    // If still empty, fallback: accent-fold scanning (scan dictionary but bounded by maxDistance)
    if (results.length === 0) {
      const inputFold = removeDiacritics(input);
      for (const [orig, cnt] of this.freq.entries()) {
        const candNorm = normalizeToken(orig, this.useLowercase);
        const candFold = removeDiacritics(candNorm);
        const dist = levenshteinDistance(inputFold, candFold, maxDistance);
        if (dist !== Infinity) {
          results.push({ term: orig, distance: dist, count: cnt });
        }
      }
    }

    // sort by distance asc, frequency desc, length closeness, lexicographic
    results.sort((a, b) => {
      if (a.distance !== b.distance) return a.distance - b.distance;
      if (a.count !== b.count) return b.count - a.count;
      const lenDiffA = Math.abs(normalizeToken(a.term, this.useLowercase).length - input.length);
      const lenDiffB = Math.abs(normalizeToken(b.term, this.useLowercase).length - input.length);
      if (lenDiffA !== lenDiffB) return lenDiffA - lenDiffB;
      return String(a.term).localeCompare(String(b.term));
    });

    const final = results.slice(0, this.maxSuggestions);

    // update cache LRU
    this.cache.set(cacheKey, final);
    if (this.cache.size > this.cacheMaxEntries) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    return final;
  }
}

export type GenOptions = {
  maxDistance?: number;
  maxSuggestions?: number;
  useLowercase?: boolean;
};

export function generateCandidates(
  word: string,
  dict: Array<string | { word: string; count?: number }>,
  options: GenOptions = {}
): string[] {
  // Map options into CandidateGenerator options
  const cgOpts = {
    maxEdit: options.maxDistance ?? 2,
    maxSuggestions: options.maxSuggestions ?? 8,
    useLowercase: options.useLowercase ?? true,
  };

  const cg = new CandidateGenerator(cgOpts);
  // Input word will be normalized in addWord
  const normalizedWord = word;

  // Normalize incoming dict: accept string[] or {word,count}[]
  const list = dict.map(d => {
    const word = typeof d === 'string' ? d : d.word;
    const count = typeof d === 'string' ? 1 : d.count ?? 1;
    return { word, count }; // Normalization now happens in addWord
  });

  // Build index and lookup
  cg.buildFromWordList(list as { word: string; count?: number }[]);
  const res = cg.lookup(normalizedWord, options.maxDistance);

  // If no candidates found via delete-forms, fallback to scanning dictionary
  // using the levenshteinDistance with the same maxDistance heuristic.
  if ((!res || res.length === 0) && list.length > 0) {
    const inputNorm = normalizeToken(normalizedWord, cgOpts.useLowercase);
    const maxDist = options.maxDistance ?? cg['getMaxDistanceForWord']?.(inputNorm) ?? cgOpts.maxEdit;
    const fallback: Array<{ term: string; distance: number; count: number }> = [];
    for (const item of list) {
      const cand = normalizeToken(item.word, cgOpts.useLowercase);
      const dist = levenshteinDistance(inputNorm, cand, maxDist);
      if (dist !== Infinity) {
        fallback.push({ term: item.word, distance: dist, count: item.count ?? 1 });
      }
    }
    // sort fallback same as lookup sorting: distance asc, freq desc, len closeness, lexicographic
    fallback.sort((a, b) => {
      if (a.distance !== b.distance) return a.distance - b.distance;
      if (a.count !== b.count) return b.count - a.count;
      const lenDiffA = Math.abs((a.term || '').length - (inputNorm || '').length);
      const lenDiffB = Math.abs((b.term || '').length - (inputNorm || '').length);
      if (lenDiffA !== lenDiffB) return lenDiffA - lenDiffB;
      return String(a.term).localeCompare(String(b.term));
    });
    const final = fallback.slice(0, cgOpts.maxSuggestions).map(f => ({ term: f.term, distance: f.distance, count: f.count }));
    return final.map(r => r.term);
  }

  // Return array of term strings (what tests expect)
  return res.map(r => r.term);
}

