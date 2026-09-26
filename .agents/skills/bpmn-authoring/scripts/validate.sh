#!/usr/bin/env bash
# Validates a .bpmn file: XSD schema -> bpmn-moddle parse warnings -> bpmnlint:recommended.
# Tools are fetched on demand into an out-of-repo cache; nothing here is added to the
# repo's own package.json or CI. See references/validation.md for the full pipeline.
#
# Usage: scripts/validate.sh <file.bpmn>
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 <file.bpmn>" >&2
  exit 2
fi

FILE="$1"
if [ ! -f "$FILE" ]; then
  echo "❌ file not found: $FILE" >&2
  exit 2
fi

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CACHE="${BPMN_TOOLS_CACHE:-$HOME/.cache/bpmn-authoring-tools}"
XSD_DIR="$CACHE/xsd"

echo "── 1/3 XSD schema validation (xmllint) ──"
mkdir -p "$XSD_DIR"
for f in BPMN20 Semantic BPMNDI DC DI; do
  if [ ! -f "$XSD_DIR/$f.xsd" ]; then
    curl -fsSL -o "$XSD_DIR/$f.xsd" "https://www.omg.org/spec/BPMN/20100501/$f.xsd"
  fi
done
xmllint --noout --schema "$XSD_DIR/BPMN20.xsd" "$FILE"

echo "── 2/3 bpmn-moddle parse warnings ──"
mkdir -p "$CACHE"
if [ ! -f "$CACHE/package.json" ]; then
  (cd "$CACHE" && npm init -y >/dev/null 2>&1)
fi
if [ ! -d "$CACHE/node_modules/bpmn-moddle" ] || [ ! -d "$CACHE/node_modules/bpmnlint" ]; then
  (cd "$CACHE" && npm install --no-audit --no-fund --silent bpmn-moddle bpmnlint)
fi
# playwright is only needed for scripts/render.mjs (optional step 6), but installing it here
# keeps one cache setup path instead of two.
if [ ! -d "$CACHE/node_modules/playwright" ]; then
  (cd "$CACHE" && npm install --no-audit --no-fund --silent playwright)
fi
node "$SKILL_DIR/scripts/check-moddle.mjs" "$CACHE" "$FILE"

echo "── 3/3 bpmnlint:recommended (max-warnings=0) ──"
"$CACHE/node_modules/.bin/bpmnlint" -c "$SKILL_DIR/assets/.bpmnlintrc" --max-warnings=0 "$FILE"

echo "✅ $FILE: XSD valid, 0 moddle warnings, 0 bpmnlint findings"
