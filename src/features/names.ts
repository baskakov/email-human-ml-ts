import { readFileSync } from "node:fs";
import { join } from "node:path";
import { tokenize } from "../normalize.ts";
import { LETTERS } from "./lexical.ts";

const MIN_MATCH = 4;

export interface NameDict {
  first: Set<string>;
  last: Set<string>;
}

export function loadNames(dir: string): NameDict {
  const read = (file: string) =>
    new Set(readFileSync(join(dir, file), "utf8").split("\n").filter((x) => x !== ""));
  return { first: read("first_names.txt"), last: read("last_names.txt") };
}

function letterSegments(local: string): string[] {
  return local.match(/[a-z]+/g) ?? [];
}

function longestMatch(segments: string[], names: Set<string>): number {
  let best = 0;
  for (const seg of segments) {
    for (let length = seg.length; length >= MIN_MATCH && length > best; length--) {
      for (let i = 0; i + length <= seg.length; i++) {
        if (names.has(seg.slice(i, i + length))) {
          best = length;
          break;
        }
      }
      if (best === length) break;
    }
  }
  return best;
}

export function nameFeatures(local: string, names: NameDict): Record<string, number> {
  const segments = letterSegments(local);
  const letters = segments.reduce((sum, s) => sum + s.length, 0);
  const tokens = tokenize(local)
    .map((t) => t.replace(/^[0-9]+|[0-9]+$/g, ""))
    .filter((t) => t !== "");
  const isName = (t: string) => names.first.has(t) || names.last.has(t);
  const longestFirst = longestMatch(segments, names.first);
  const longestLast = longestMatch(segments, names.last);
  return {
    contains_first_name: Number(longestFirst > 0),
    contains_last_name: Number(longestLast > 0),
    first_token_is_name: Number(tokens.length > 0 && isName(tokens[0]!)),
    name_token_count: tokens.filter(isName).length,
    name_char_ratio: letters ? Math.max(longestFirst, longestLast) / letters : 0,
  };
}
