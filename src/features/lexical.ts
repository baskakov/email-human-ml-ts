import { tokenize } from "../normalize.ts";

export const DIGITS = "0123456789";
export const LETTERS = "abcdefghijklmnopqrstuvwxyz";
export const VOWELS = "aeiou";
export const CONSONANTS = [...LETTERS].filter((c) => !VOWELS.includes(c)).join("");
const YEAR_MIN = 1940;
const YEAR_MAX = 2026;
const KEYBOARD_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

export const isIn = (charset: string, ch: string | undefined): boolean =>
  ch !== undefined && charset.includes(ch);

export function entropy(chars: string[]): number {
  if (chars.length === 0) return 0;
  const counts = new Map<string, number>();
  for (const ch of chars) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  const n = chars.length;
  let sum = 0;
  for (const c of counts.values()) sum += (c / n) * Math.log2(c / n);
  return -sum;
}

export function longestRun(chars: string[], charset: string): number {
  let best = 0;
  let cur = 0;
  for (const ch of chars) {
    cur = charset.includes(ch) ? cur + 1 : 0;
    best = Math.max(best, cur);
  }
  return best;
}

const count = (chars: string[], ch: string) => chars.filter((c) => c === ch).length;

export function lexicalFeatures(local: string): Record<string, number> {
  const chars = [...local];
  const n = chars.length;
  const denom = Math.max(n, 1);
  const letters = chars.filter((c) => LETTERS.includes(c)).length;
  const digits = chars.filter((c) => DIGITS.includes(c)).length;
  const dots = count(chars, ".");
  const dashes = count(chars, "-");
  const underscores = count(chars, "_");
  const digitRuns = local.match(/[0-9]+/g) ?? [];
  const unique = new Set(chars).size;
  const first = chars[0];
  const last = chars[n - 1];
  let repeated = 0;
  for (let i = 1; i < n; i++) if (chars[i] === chars[i - 1]) repeated++;

  return {
    length: n,
    letter_count: letters,
    digit_count: digits,
    digit_ratio: digits / denom,
    dot_count: dots,
    dash_count: dashes,
    underscore_count: underscores,
    separator_ratio: (dots + dashes + underscores) / denom,
    starts_with_digit: Number(isIn(DIGITS, first)),
    ends_with_digit: Number(isIn(DIGITS, last)),
    starts_with_letter: Number(isIn(LETTERS, first)),
    ends_with_letter: Number(isIn(LETTERS, last)),
    longest_digit_run: longestRun(chars, DIGITS),
    longest_letter_run: longestRun(chars, LETTERS),
    unique_char_count: unique,
    unique_char_ratio: unique / denom,
    entropy: entropy(chars),
    repeated_char_count: repeated,
    has_year: Number(digitRuns.some((r) => r.length === 4 && +r >= YEAR_MIN && +r <= YEAR_MAX)),
    has_4_digit_number: Number(digitRuns.some((r) => r.length >= 4)),
  };
}

export function structureFeatures(local: string): Record<string, number> {
  const chars = [...local];
  const lengths = tokenize(local).map((t) => [...t].length);
  return {
    longest_consonant_run: longestRun(chars, CONSONANTS),
    longest_vowel_run: longestRun(chars, VOWELS),
    number_of_tokens: lengths.length,
    average_token_length: lengths.length ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0,
    max_token_length: lengths.length ? Math.max(...lengths) : 0,
    min_token_length: lengths.length ? Math.min(...lengths) : 0,
  };
}

export function longestKeyboardRun(local: string): number {
  let best = 0;
  for (const row of KEYBOARD_ROWS) {
    for (let i = 0; i < row.length; i++) {
      for (let j = i + Math.max(3, best + 1); j <= row.length; j++) {
        if (!local.includes(row.slice(i, j))) break;
        best = j - i;
      }
    }
  }
  return best;
}
