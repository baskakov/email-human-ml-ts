import assert from "node:assert/strict";
import { test } from "node:test";
import { loadModel } from "../src/model.ts";
import { loadParity, VERSIONS } from "./versions.ts";

for (const version of VERSIONS) {
  test(`${version}: ONNX scores match Python within tolerance`, async () => {
    const parity = loadParity(version);
    const model = await loadModel("models", version);
    const results = await model.score(parity.cases.map((c) => c.email));
    results.forEach((r, i) => {
      const expected = parity.cases[i]!.score;
      assert.ok(
        Math.abs(r.score - expected) <= parity.tolerance,
        `${r.email}: ts=${r.score} py=${expected}`,
      );
    });
  });
}

test("empty batch returns no results", async () => {
  const model = await loadModel("models", VERSIONS[0]!);
  assert.deepEqual(await model.score([]), []);
});
