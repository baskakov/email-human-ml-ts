# email-human-ml-ts

HTTP API that scores how human-like an email address looks. It runs the ONNX model trained in
`../email-validator-ml` with `onnxruntime-node` behind a server.

`ivan.ivanov@gmail.com` → 0.986, `xnjjeka.2.e.2.2@gmail.com` → 0.000 (model `email-pattern-v2`).

The score describes the spelling of the local part only. It is a risk signal, not a verdict on
whether the mailbox exists.

## Requirements

Node.js 24 or newer. TypeScript runs natively (type stripping): no build step.

## Run

```bash
npm install
npm start                 # http://localhost:3000
npm run dev               # restart on file changes
```

- `PORT` : `3000` 
- `MODEL_DIR` : `models`  folder with the model and dictionaries 
- `MODEL_VERSION` : `email-pattern-v2`  file prefix of the model in `MODEL_DIR` (`email-pattern-v1` still ships) 

## API

### `GET /score?email=…`

```bash
curl "localhost:3000/score?email=ivan.ivanov@gmail.com"
# {"email":"ivan.ivanov@gmail.com","local":"ivan.ivanov","score":0.9863}
```

A missing or empty `email` returns `400` with `{"error": "..."}`.

## Tests

```bash
npm test            # feature parity, ONNX parity, HTTP contract
npm run typecheck
```

`test/fixtures/<version>.parity.json` comes from the Python export: 63 emails with the expected
feature vector and score. Tests run against every version that has a fixture file. The TypeScript extractor must reproduce every feature exactly (after the
float32 cast) and the score within `1e-5`.

## Updating the model

```bash
# in ../email-validator-ml: train and export, e.g. models/email-pattern-v3
npm run sync-model                                # copies v2 by default
MODEL_VERSION=email-pattern-v3 npm run sync-model
npm test
MODEL_VERSION=email-pattern-v3 npm start
```

`sync-model` copies `<version>.onnx`, `.meta.json`, `.ngrams.json`, the name dictionaries and
the parity fixtures. Set `ML_REPO` if the Python repo lives elsewhere. If a new version changes
feature definitions, the parity test fails until `src/features/` is updated to match.
