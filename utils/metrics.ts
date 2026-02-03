
/**
 * Calculates the Levenshtein distance between two strings.
 */
export const levenshtein = (s1: string, s2: string): number => {
  const m = s1.length;
  const n = s2.length;
  const d: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let j = 1; j <= n; j++) {
    for (let i = 1; i <= m; i++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,      // deletion
        d[i][j - 1] + 1,      // insertion
        d[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return d[m][n];
};

/**
 * Calculates Character Error Rate (CER).
 */
export const calculateCER = (groundTruth: string, hypothesis: string): number => {
  if (groundTruth.length === 0) return hypothesis.length === 0 ? 0 : 1;
  const distance = levenshtein(groundTruth, hypothesis);
  return Math.min(distance / groundTruth.length, 1);
};

/**
 * Calculates Word Error Rate (WER).
 */
export const calculateWER = (groundTruth: string, hypothesis: string): number => {
  const gtWords = groundTruth.trim().split(/\s+/).filter(w => w.length > 0);
  const hWords = hypothesis.trim().split(/\s+/).filter(w => w.length > 0);

  if (gtWords.length === 0) return hWords.length === 0 ? 0 : 1;

  // Use Levenshtein but on word arrays instead of characters
  const m = gtWords.length;
  const n = hWords.length;
  const d: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let j = 1; j <= n; j++) {
    for (let i = 1; i <= m; i++) {
      const cost = gtWords[i - 1] === hWords[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost
      );
    }
  }
  
  return Math.min(d[m][n] / gtWords.length, 1);
};
