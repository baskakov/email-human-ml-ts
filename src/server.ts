import { serve } from "@hono/node-server";
import { createApp } from "./app.ts";
import { loadModel } from "./model.ts";

const port = Number(process.env.PORT ?? 3000);
const modelDir = process.env.MODEL_DIR ?? "models";
const modelVersion = process.env.MODEL_VERSION ?? "email-pattern-v2";

const model = await loadModel(modelDir, modelVersion);
const app = createApp(model);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`${model.meta.version} started on http://localhost:${info.port}`);
});
