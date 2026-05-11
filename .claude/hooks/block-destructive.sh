#!/usr/bin/env bash
# PreToolUse hook: block destructive operations
# Reads tool invocation from stdin as JSON, exits 2 to block.

set -euo pipefail

INPUT=$(cat)

# Extract the command being run (works for Bash tool invocations)
CMD=$(echo "$INPUT" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('tool_input', {}).get('command', ''))" 2>/dev/null || echo "")

if [ -z "$CMD" ]; then
    # Not a bash invocation we care about, allow
    exit 0
fi

# Patterns to block (extend as needed)
BLOCKED_PATTERNS=(
    'rm[[:space:]]+-rf?[[:space:]]+/'
    'rm[[:space:]]+-rf?[[:space:]]+\*'
    'rm[[:space:]]+-rf?[[:space:]]+~'
    'rm[[:space:]]+-rf?[[:space:]]+\$HOME'
    'git[[:space:]]+push.*--force'
    'git[[:space:]]+push.*-f([[:space:]]|$)'
    '>[[:space:]]*/dev/sd[a-z]'
    'mkfs\.'
    'dd[[:space:]]+if=.*of=/dev/'
    'chmod[[:space:]]+-R[[:space:]]+777[[:space:]]+/'
    ':(){ :|:& };:'  # fork bomb
)

for pattern in "${BLOCKED_PATTERNS[@]}"; do
    if echo "$CMD" | grep -qE "$pattern"; then
        echo "BLOCKED: command matches destructive pattern '$pattern'" >&2
        echo "Command was: $CMD" >&2
        exit 2  # exit 2 = block tool execution
    fi
done

# Block writes outside project root
PROJECT_ROOT=$(pwd)
if echo "$CMD" | grep -qE '(>|>>)[[:space:]]*/(?!tmp|var/folders)'; then
    REDIRECT_TARGET=$(echo "$CMD" | grep -oE '(>|>>)[[:space:]]*[^ ]+' | tail -1 | sed -E 's/^(>|>>)[[:space:]]*//')
    if [[ "$REDIRECT_TARGET" = /* && "$REDIRECT_TARGET" != "$PROJECT_ROOT"* && "$REDIRECT_TARGET" != /tmp/* && "$REDIRECT_TARGET" != /var/folders/* ]]; then
        echo "BLOCKED: write outside project root: $REDIRECT_TARGET" >&2
        exit 2
    fi
fi

exit 0
