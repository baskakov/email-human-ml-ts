import { Hono } from "hono";
import type { Model } from "./model.ts";

const round = (x: number) => Math.round(x * 10_000) / 10_000;

export function createApp(model: Model) {
  const app = new Hono();

  app.get("/score", async (c) => {
    const email = c.req.query("email");
    if (!email) return c.json({ error: "query parameter 'email' is required" }, 400);
    const [result] = await model.score([email]);
    return c.json({ ...result!, score: round(result!.score) });
  });

  return app;
}
