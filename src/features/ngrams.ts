import { readFileSync } from "node:fs";
import { LETTERS } from "./lexical.ts";

export interface NgramVocab {
  bigram_logfreq: Record<string, number>;
  trigram_logfreq: Record<string, number>;
  rare_bigram_threshold: number;
  rare_trigram_threshold: number;
  unknown_bigram_logfreq: number;
  unknown_trigram_logfreq: number;
  backoff?: boolean;
  backoff_offset?: number;
}

export function loadVocab(path: string): NgramVocab {
  return JSON.parse(readFileSync(path, "utf8")) as NgramVocab;
}

const lettersOnly = (local: string) => [...local].filter((c) => LETTERS.includes(c)).join("");

function ngrams(text: string, n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i + n <= text.length; i++) out.push(text.slice(i, i + n));
  return out;
}

const lookup = (table: Record<string, number>, g: string, unknown: number) =>
  Object.hasOwn(table, g) ? table[g]! : unknown;

function trigramLogfreq(g: string, vocab: NgramVocab): number {
  if (Object.hasOwn(vocab.trigram_logfreq, g)) return vocab.trigram_logfreq[g]!;
  if (!vocab.backoff) return vocab.unknown_trigram_logfreq;
  const bi = vocab.bigram_logfreq;
  const unknown = vocab.unknown_bigram_logfreq;
  return (lookup(bi, g.slice(0, 2), unknown) + lookup(bi, g.slice(1), unknown)) / 2 + vocab.backoff_offset!;
}

function stats(values: number[], rare: number) {
  if (values.length === 0) return { avg: 0, min: 0, rareRatio: 0 };
  return {
    avg: values.reduce((a, b) => a + b, 0) / values.length,
    min: Math.min(...values),
    rareRatio: values.filter((v) => v < rare).length / values.length,
  };
}

export function ngramFeatures(local: string, vocab: NgramVocab): Record<string, number> {
  const text = lettersOnly(local);
  const biValues = ngrams(text, 2).map((g) => lookup(vocab.bigram_logfreq, g, vocab.unknown_bigram_logfreq));
  const triValues = ngrams(text, 3).map((g) => trigramLogfreq(g, vocab));
  const bi = stats(biValues, vocab.rare_bigram_threshold);
  const tri = stats(triValues, vocab.rare_trigram_threshold);
  return {
    bigram_avg_frequency: bi.avg,
    bigram_min_frequency: bi.min,
    trigram_avg_frequency: tri.avg,
    trigram_min_frequency: tri.min,
    rare_bigram_ratio: bi.rareRatio,
    rare_trigram_ratio: tri.rareRatio,
  };
}
