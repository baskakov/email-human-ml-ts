import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as ort from "onnxruntime-node";
import { extract, type FeatureContext } from "./features/extractor.ts";
import { loadNames } from "./features/names.ts";
import { loadVocab } from "./features/ngrams.ts";
import { splitEmail } from "./normalize.ts";

export interface ModelMeta {
  version: string;
  feature_order: string[];
  input: { name: string };
  output: { name: string; score_column: number };
  files: { ngrams: string };
  dots_ignored_domains?: string[] | null;
}

export interface ScoreResult {
  email: string;
  local: string;
  score: number;
}

export interface Model {
  meta: ModelMeta;
  ctx: FeatureContext;
  score(emails: string[]): Promise<ScoreResult[]>;
}

export async function loadModel(dir: string, version: string): Promise<Model> {
  const meta = JSON.parse(readFileSync(join(dir, `${version}.meta.json`), "utf8")) as ModelMeta;
  const session = await ort.InferenceSession.create(join(dir, `${meta.version}.onnx`));
  const ctx: FeatureContext = {
    vocab: loadVocab(join(dir, meta.files.ngrams)),
    names: loadNames(dir),
    dotsIgnoredDomains: meta.dots_ignored_domains ?? [],
  };
  const width = meta.feature_order.length;

  async function score(emails: string[]): Promise<ScoreResult[]> {
    if (emails.length === 0) return [];
    const parts = emails.map(splitEmail);
    const data = new Float32Array(emails.length * width);
    parts.forEach(([local, domain], row) =>
      data.set(extract(local, ctx, meta.feature_order, domain), row * width),
    );
    const input = new ort.Tensor("float32", data, [emails.length, width]);
    const output = await session.run({ [meta.input.name]: input });
    const probs = output[meta.output.name]!.data as Float32Array;
    return emails.map((email, row) => ({
      email,
      local: parts[row]![0],
      score: probs[row * 2 + meta.output.score_column]!,
    }));
  }

  return { meta, ctx, score };
}

