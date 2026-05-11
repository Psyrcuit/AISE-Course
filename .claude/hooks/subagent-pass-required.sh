#!/usr/bin/env bash
# SubagentStop hook: ensure subagent verdicts are honored
# Reads subagent output, blocks if it returned FAIL without acknowledgment.

set -euo pipefail

INPUT=$(cat)

# Extract the subagent's final message
FINAL_MESSAGE=$(echo "$INPUT" | python3 -c "
import sys, json
data = json.load(sys.stdin)
# Subagent stop hook receives final output in result field
print(data.get('result', '') or data.get('output', ''))
" 2>/dev/null || echo "")

# Check for FAIL verdict at start of message (matches subagent output spec)
if echo "$FINAL_MESSAGE" | head -3 | grep -qE '^FAIL:'; then
    # Append a note that main agent must address these issues
    cat <<EOF
{
  "decision": "block",
  "reason": "Subagent returned FAIL verdict. You must address every issue in the subagent's output before proceeding to the next milestone. Do not skip or rationalize away any BLOCKER or critical violation."
}
EOF
    exit 0
fi

# PASS or unrecognized format: allow
exit 0
