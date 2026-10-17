import { readdirSync, readFileSync } from "node:fs";

export interface ParityCase {
  email: string;
  local: string;
  domain?: string;
  features: number[];
  score: number;
}

export interface Parity {
  feature_order: string[];
  tolerance: number;
  cases: ParityCase[];
}

export const VERSIONS = readdirSync("test/fixtures")
  .filter((f) => f.endsWith(".parity.json"))
  .map((f) => f.replace(".parity.json", ""))
  .sort();

export const loadParity = (version: string): Parity =>
  JSON.parse(readFileSync(`test/fixtures/${version}.parity.json`, "utf8")) as Parity;
