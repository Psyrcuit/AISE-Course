#!/usr/bin/env bash
# PostToolUse hook: lint course.html after every Write/Edit/MultiEdit
# Non-blocking warning. The Stop-gate hook is the actual blocker.

set -euo pipefail

INPUT=$(cat)

# Extract the file that was modified
FILE_PATH=$(echo "$INPUT" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('tool_input', {}).get('file_path', ''))" 2>/dev/null || echo "")

# Only lint course.html
if [ -z "$FILE_PATH" ] || [[ "$FILE_PATH" != *"course.html" ]]; then
    exit 0
fi

# Run html-validate if available
if command -v npx &> /dev/null; then
    if ! OUTPUT=$(npx --no-install html-validate "$FILE_PATH" 2>&1); then
        # Output goes to stderr so Claude sees it as feedback
        echo "html-validate warnings on course.html:" >&2
        echo "$OUTPUT" >&2
        # Exit 0 (don't block) — Stop-gate will block at session end if still failing
    fi
fi

exit 0
