#!/usr/bin/env bash
# PostToolUse hook (async): log token usage to .claude/usage.log
# Helps track burn rate without interrupting Claude with /usage commands.

set -euo pipefail

LOG_FILE=".claude/usage.log"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

INPUT=$(cat)

# Extract token counts if present in tool result
INPUT_TOKENS=$(echo "$INPUT" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('usage', {}).get('input_tokens', 0))" 2>/dev/null || echo "0")
OUTPUT_TOKENS=$(echo "$INPUT" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('usage', {}).get('output_tokens', 0))" 2>/dev/null || echo "0")
TOOL_NAME=$(echo "$INPUT" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('tool_name', 'unknown'))" 2>/dev/null || echo "unknown")

# Append to log (CSV format for easy analysis)
mkdir -p "$(dirname "$LOG_FILE")"
echo "$TIMESTAMP,$TOOL_NAME,$INPUT_TOKENS,$OUTPUT_TOKENS" >> "$LOG_FILE"

exit 0
