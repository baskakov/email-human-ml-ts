import assert from "node:assert/strict";
import { test } from "node:test";
import { createApp } from "../src/app.ts";
import { loadModel } from "../src/model.ts";

const app = createApp(await loadModel("models", "email-pattern-v2"));

test("GET /score scores a single email", async () => {
  const res = await app.request("/score?email=ivan.ivanov@gmail.com");
  assert.equal(res.status, 200);
  const body = (await res.json()) as { local: string; score: number };
  assert.equal(body.local, "ivan.ivanov");
  assert.ok(body.score > 0.9);
});

test("GET /score gives a low score to a generated email", async () => {
  const res = await app.request("/score?email=xnjjeka.2.e.2.2@gmail.com");
  assert.equal(res.status, 200);
  const body = (await res.json()) as { score: number };
  assert.ok(body.score < 0.1);
});

test("GET /score without email returns 400", async () => {
  assert.equal((await app.request("/score")).status, 400);
});
