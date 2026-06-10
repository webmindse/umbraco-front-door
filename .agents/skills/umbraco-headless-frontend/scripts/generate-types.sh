#!/usr/bin/env bash
# Regenerate TypeScript types from the Umbraco Delivery API swagger.
#
# Usage:
#   UMBRACO_BASE_URL=https://cms.example.com ./generate-types.sh
#
# Writes: src/integrations/umbraco/types.ts
#
# Idempotent — safe to re-run any time the Umbraco content model changes.

set -euo pipefail

: "${UMBRACO_BASE_URL:?UMBRACO_BASE_URL must be set (e.g. https://cms.example.com)}"

SWAGGER_URL="${UMBRACO_BASE_URL%/}/umbraco/delivery/api/v2/swagger.json"
OUT_DIR="src/integrations/umbraco"
OUT_FILE="${OUT_DIR}/types.ts"

mkdir -p "${OUT_DIR}"

echo "Fetching swagger from: ${SWAGGER_URL}"
echo "Writing types to:     ${OUT_FILE}"

# Use bunx so no global install is needed.
bunx openapi-typescript "${SWAGGER_URL}" --output "${OUT_FILE}"

echo "Done. Types written to ${OUT_FILE}."
echo "Import with:  import type { components } from \"@/integrations/umbraco/types\";"
