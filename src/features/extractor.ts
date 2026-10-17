import { lexicalFeatures, longestKeyboardRun, structureFeatures } from "./lexical.ts";
import { type NameDict, nameFeatures } from "./names.ts";
import { type NgramVocab, ngramFeatures } from "./ngrams.ts";

export interface FeatureContext {
  vocab: NgramVocab;
  names: NameDict;
  dotsIgnoredDomains: string[];
}

export function extractDict(local: string, ctx: FeatureContext, domain = ""): Record<string, number> {
  return {
    ...lexicalFeatures(local),
    ...structureFeatures(local),
    ...ngramFeatures(local, ctx.vocab),
    ...nameFeatures(local, ctx.names),
    longest_keyboard_run: longestKeyboardRun(local),
    dots_ignored: Number(ctx.dotsIgnoredDomains.includes(domain)),
  };
}

export function extract(
  local: string,
  ctx: FeatureContext,
  featureOrder: string[],
  domain = "",
): number[] {
  const values = extractDict(local, ctx, domain);
  return featureOrder.map((name) => {
    const v = values[name];
    if (v === undefined) throw new Error(`unknown feature in meta.json: ${name}`);
    return v;
  });
}
