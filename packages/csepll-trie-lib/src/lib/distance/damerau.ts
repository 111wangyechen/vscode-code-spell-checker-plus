// packages/cspell-trie-lib/src/lib/distance/damerau.ts
export function damerauLevenshtein(a: string, b: string, maxDistance: number = Infinity): number {
  if (a === b) return 0;
  // normalize lengths
  const n = a.length;
  const m = b.length;
  if (Math.abs(n - m) > maxDistance) return Infinity;

  // Use the "full" Damerau algorithm with a map of last occurrence positions
  const INF = n + m;
  const H: number[][] = Array.from({ length: n + 2 }, () => new Array(m + 2).fill(0));
  H[0][0] = INF;
  for (let i = 0; i <= n; i++) {
    H[i + 1][1] = i;
    H[i + 1][0] = INF;
  }
  for (let j = 0; j <= m; j++) {
    H[1][j + 1] = j;
    H[0][j + 1] = INF;
  }

  const da = new Map<string, number>();
  for (let i = 1; i <= n; i++) {
    let db = 0;
    for (let j = 1; j <= m; j++) {
      const i1 = da.get(b[j - 1]) ?? 0;
      const j1 = db;
      let cost = 1;
      if (a[i - 1] === b[j - 1]) {
        cost = 0;
        db = j;
      }
      H[i + 1][j + 1] = Math.min(
        H[i][j] + cost,                    // substitution
        H[i + 1][j] + 1,                   // insertion
        H[i][j + 1] + 1,                   // deletion
        H[i1][j1] + (i - i1 - 1) + 1 + (j - j1 - 1) // transposition
      );
    }
    da.set(a[i - 1], i);
  }

  const dist = H[n + 1][m + 1];
  return dist <= maxDistance ? dist : Infinity;
}
