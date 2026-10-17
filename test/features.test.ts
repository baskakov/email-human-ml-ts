import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { extract } from "../src/features/extractor.ts";
import { loadNames } from "../src/features/names.ts";
import { loadVocab } from "../src/features/ngrams.ts";
import type { ModelMeta } from "../src/model.ts";
import { splitEmail } from "../src/normalize.ts";
import { loadParity, VERSIONS } from "./versions.ts";

const names = loadNames("models");

test("splitEmail matches Python normalization", () => {
  assert.deepEqual(splitEmail("  Ivan.Ivanov@Gmail.com "), ["ivan.ivanov", "gmail.com"]);
  assert.deepEqual(splitEmail("a@b@c.com"), ["a@b", "c.com"]);
  assert.deepEqual(splitEmail("no-at-sign"), ["no-at-sign", ""]);
});

for (const version of VERSIONS) {
  test(`${version}: feature vectors match Python fixtures`, () => {
    const parity = loadParity(version);
    const meta = JSON.parse(readFileSync(`models/${version}.meta.json`, "utf8")) as ModelMeta;
    assert.deepEqual(parity.feature_order, meta.feature_order);
    const ctx = {
      vocab: loadVocab(`models/${meta.files.ngrams}`),
      names,
      dotsIgnoredDomains: meta.dots_ignored_domains ?? [],
    };
    for (const c of parity.cases) {
      const [local, domain] = splitEmail(c.email);
      assert.equal(local, c.local);
      const got = extract(local, ctx, parity.feature_order, domain);
      got.forEach((value, i) => {
        assert.equal(
          Math.fround(value),
          c.features[i],
          `${c.email}: ${parity.feature_order[i]} ts=${value} py=${c.features[i]}`,
        );
      });
    }
  });
}
