#!/bin/sh
set -e
SRC="${ML_REPO:-../email-human-ml}"
VERSION="${MODEL_VERSION:-email-pattern-v2}"

cp "$SRC/models/$VERSION.onnx" "$SRC/models/$VERSION.meta.json" "$SRC/models/$VERSION.ngrams.json" models/
cp "$SRC/data/dictionaries/first_names.txt" "$SRC/data/dictionaries/last_names.txt" models/
cp "$SRC/tests/fixtures/$VERSION.parity.json" test/fixtures/
echo "synced $VERSION from $SRC"
