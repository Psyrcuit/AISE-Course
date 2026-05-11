#!/usr/bin/env python3
"""
Stop hook: the gate that blocks Claude from declaring 'done' before
acceptance criteria pass. Runs the deterministic validators and returns
a structured decision to Claude Code.

CRITICAL: must check stop_hook_active to avoid infinite loops.
"""

import json
import subprocess
import sys
import os

def main():
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        # No input or malformed input: don't block
        sys.exit(0)

    # CRITICAL infinite-loop prevention. NEVER skip this check.
    if data.get("stop_hook_active"):
        sys.exit(0)

    # Only run if course.html actually exists
    if not os.path.exists("course.html"):
        sys.exit(0)  # nothing to validate yet

    checks = [
        {
            "name": "HTML validation",
            "cmd": ["npx", "--no-install", "html-validate", "course.html"],
            "timeout": 60,
        },
        {
            "name": "Accessibility (axe-core WCAG 2.2 AA)",
            "cmd": ["npx", "--no-install", "@axe-core/cli", "course.html",
                    "--tags", "wcag2a,wcag2aa,wcag21aa,wcag22aa"],
            "timeout": 90,
        },
        {
            "name": "Playwright tests",
            "cmd": ["npx", "--no-install", "playwright", "test", "--reporter=line"],
            "timeout": 180,
            "skip_if_missing": "tests",
        },
    ]

    failures = []

    for check in checks:
        # Skip Playwright if no tests directory
        if check.get("skip_if_missing") and not os.path.exists(check["skip_if_missing"]):
            continue

        try:
            result = subprocess.run(
                check["cmd"],
                capture_output=True,
                timeout=check["timeout"],
                text=True,
            )
            if result.returncode != 0:
                # Truncate output to last ~1500 chars to avoid context bloat
                output = (result.stdout + "\n" + result.stderr)[-1500:]
                failures.append({
                    "check": check["name"],
                    "exit_code": result.returncode,
                    "output_tail": output,
                })
        except subprocess.TimeoutExpired:
            failures.append({
                "check": check["name"],
                "exit_code": "TIMEOUT",
                "output_tail": f"Check exceeded {check['timeout']}s timeout.",
            })
        except FileNotFoundError:
            # Missing dependency — note but don't block (developer may not have set it up yet)
            failures.append({
                "check": check["name"],
                "exit_code": "MISSING_DEPENDENCY",
                "output_tail": f"Command not found: {' '.join(check['cmd'])}. Install via `npm install` or skip if intentional.",
            })

    if failures:
        # Build a concrete blocking message
        reason_lines = ["Stop-gate blocked: acceptance criteria not met.", ""]
        for f in failures:
            reason_lines.append(f"### {f['check']} (exit {f['exit_code']})")
            reason_lines.append("```")
            reason_lines.append(f["output_tail"])
            reason_lines.append("```")
            reason_lines.append("")
        reason_lines.append("Fix these issues, then continue. Do not declare done until Stop-gate returns clean.")

        response = {
            "decision": "block",
            "reason": "\n".join(reason_lines),
        }
        print(json.dumps(response))
        sys.exit(0)

    # All checks passed
    sys.exit(0)


if __name__ == "__main__":
    main()
