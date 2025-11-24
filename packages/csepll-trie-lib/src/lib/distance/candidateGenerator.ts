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
  // NFC normalization and trim
  let t = s.normalize('NFC').trim();
  if (toLower) t = t.toLowerCase();
  return t;
}

// 带 maxDistance 的 Levenshtein（带早停，基于原回答的带宽DP实现）
export function levenshteinDistance(a: string, b: string, maxDistance: number = Infinity): number {
  if (a === b) return 0;
  const n = a.length, m = b.length;
  if (Math.abs(n - m) > maxDistance) return Infinity;
  if (n > m) return levenshteinDistance(b, a, maxDistance);

  const prev = new Array(n + 1);
  const curr = new Array(n + 1);

  for (let i = 0; i <= n; i++) prev[i] = i;

  for (let j = 1; j <= m; j++) {
    curr[0] = j;
    const bj = b.charAt(j - 1);

    const low = Math.max(1, j - maxDistance);
    const high = Math.min(n, j + maxDistance);

    if (low > 1) curr[low - 1] = Infinity;

    for (let i = low; i <= high; i++) {
      const cost = a.charAt(i - 1) === bj ? 0 : 1;
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

  // delete-form -> Set of original words
  private deletes: Map<string, Set<string>> = new Map();
  // frequency map of original words
  private freq: Map<string, number> = new Map();

  // simple LRU cache for recent lookup results
  private cache: Map<string, Candidate[]> = new Map();
  private cacheMaxEntries = 1000;

  constructor(opts?: CandidateGeneratorOptions) {
    this.maxEdit = opts?.maxEdit ?? 2;
    this.maxSuggestions = opts?.maxSuggestions ?? 8;
    this.useLowercase = opts?.useLowercase ?? true;
    this.maxQueueSize = opts?.maxQueueSize ?? 100000; // guardrail
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

  // add one word to structures (word should be normalized already)
  addWord(word: string, count = 1): void {
    const w = normalizeToken(word, this.useLowercase);
    if (!w) return;
    this.freq.set(w, (this.freq.get(w) ?? 0) + (count ?? 1));
    // also map the exact word itself (helps exact match lookups)
    if (!this.deletes.has(w)) this.deletes.set(w, new Set());
    this.deletes.get(w)!.add(w);

    const variants = this.generateDeletes(w);
    for (const v of variants) {
      if (!this.deletes.has(v)) this.deletes.set(v, new Set());
      this.deletes.get(v)!.add(w);
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
    for (const [k, s] of this.deletes.entries()) deletesObj[k] = Array.from(s);
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
    for (const p of token.split(/[_\-\.\s]+/g)) {
      if (!p) continue;
      // split camelCase boundaries
      const camel = p.replace(/([a-z])([A-Z0-9])/g, '$1 $2').replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
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

    // identifier-splitting heuristic: try smaller tokens first for short identifiers
    const tokens = this.splitIdentifier(input);
    // we'll check tokens from longest->shortest? choose tokens with higher chance first: shorter tokens are stricter so try longer first
    tokens.sort((a,b)=>b.length - a.length);

    const maxDistance = this.getMaxDistanceForWord(input, maxDistanceParam);

    // collect candidate original words using delete forms of input tokens
    const candidatesMap = new Map<string, number>(); // candidate -> bestEstimateDistance (we'll compute exact later)
    const seenDeletes = new Set<string>();
    const queue: string[] = [input];
    const seenQueue = new Set<string>([input]);

    // generate deletes from input up to maxDistance (BFS)
    for (let depth = 0; depth < maxDistance; depth++) {
      const nextQueue: string[] = [];
      for (const token of queue) {
        // check mapping
        const bucket = this.deletes.get(token);
        if (bucket) {
          for (const w of bucket) {
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

    // If no candidates found from delete-forms, fallback: maybe exact match exists
    if (candidatesMap.size === 0) {
      const exactBucket = this.deletes.get(input);
      if (exactBucket) for (const w of exactBucket) candidatesMap.set(w, 0);
    }

    // verify candidates with exact edit distance (bounded)
    const results: Candidate[] = [];
    for (const cand of candidatesMap.keys()) {
      const dist = levenshteinDistance(input, cand, maxDistance);
      if (dist !== Infinity) {
        results.push({ term: cand, distance: dist, count: this.freq.get(cand) ?? 1 });
      }
    }

    // sort by distance asc, frequency desc, length closeness, lexicographic
    results.sort((a, b) => {
      if (a.distance !== b.distance) return a.distance - b.distance;
      if (a.count !== b.count) return b.count - a.count;
      const lenDiffA = Math.abs(a.term.length - (input?.length || 0));
      const lenDiffB = Math.abs(b.term.length - (input?.length || 0));
      if (lenDiffA !== lenDiffB) return lenDiffA - lenDiffB;
      return a.term.localeCompare(b.term);
    });

    const final = results.slice(0, this.maxSuggestions);
    if (!final.length) return final;

    // update cache LRU
    this.cache.set(cacheKey, final);
    if (this.cache.size > this.cacheMaxEntries) {
      // remove oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    return final;
  }
}

