# Setup Guide — Windows ARM64

This guide walks you through getting the Claude Code build environment fully wired up on Windows ARM64, from zero to "type the kickoff prompt and let it run."

Total time: 30-45 minutes if everything goes smoothly. Add 15-30 minutes for the inevitable Windows ARM64 quirks.

---

## Step 1 — Stage the project directory

You should have downloaded a `claude_setup/` folder containing:

```
claude_setup/
├── README.md
├── SETUP.md  (this file)
├── KICKOFF_PROMPT.md
├── CLAUDE.md
├── SPEC.md
├── CONTENT.md
├── GAMIFICATION.md
├── course_2026_baseline_plan.md
├── course_master_glossary.md      ← the ~390 concept stubs (mandatory)
├── course_gamification_design.md
├── course_integration_layer.md    ← Toolkit, Playbook, Decision tools spec (mandatory)
├── course_editor_spec.md          ← Editor pattern + Personal Library (mandatory)
└── dotclaude/
    ├── settings.json
    ├── agents/
    │   ├── code-reviewer.md
    │   ├── a11y-auditor.md
    │   ├── logic-verifier.md
    │   └── content-sanity.md
    └── hooks/
        ├── block-destructive.sh
        ├── lint-on-write.sh
        ├── log-tokens.sh
        ├── stop-gate.py
        └── subagent-pass-required.sh
```

Move the contents of `claude_setup/` into your project directory at:

```
C:\Users\chase\Documents\Psyrcuit\course\
```

Then **rename `dotclaude` to `.claude`**:

```powershell
cd C:\Users\chase\Documents\Psyrcuit\course
Rename-Item -Path "dotclaude" -NewName ".claude"
```

Windows File Explorer can't easily create folders that start with a dot, which is why the package uses `dotclaude` and you rename it post-extract.

Final layout:

```
course/
├── CLAUDE.md
├── SPEC.md
├── CONTENT.md
├── GAMIFICATION.md
├── KICKOFF_PROMPT.md
├── SETUP.md
├── course_2026_baseline_plan.md
├── course_master_glossary.md
├── course_gamification_design.md
├── course_integration_layer.md
├── course_editor_spec.md
├── .claude/
│   ├── settings.json
│   ├── agents/  (4 .md files)
│   └── hooks/   (5 scripts)
└── tests/
```

---

## Step 2 — Install Claude Code

```powershell
winget install Anthropic.ClaudeCode
```

If you already have Claude Code installed, update it:

```powershell
winget upgrade Anthropic.ClaudeCode
```

You need v2.1.41 or newer for Windows ARM64 native support. Verify:

```powershell
claude --version
```

If you get "claude is not recognized as the name of a cmdlet," your PATH is missing `~/.local/bin`. Fix:

```powershell
[Environment]::SetEnvironmentVariable("PATH", "$env:PATH;$env:USERPROFILE\.local\bin", "User")
```

Restart PowerShell, try again.

---

## Step 3 — Install Git for Windows (required by Claude Code)

```powershell
winget install Git.Git
```

Restart PowerShell after this so Git Bash is on PATH. Claude Code uses Git Bash to run shell hooks even on Windows.

Configure line endings to avoid CRLF noise sneaking into the single HTML file:

```powershell
git config --global core.autocrlf input
```

In your project directory, create `.gitattributes`:

```
* text=auto eol=lf
```

---

## Step 4 — Install Node.js (required for hooks and validators)

```powershell
winget install OpenJS.NodeJS.LTS
```

Restart PowerShell. Verify:

```powershell
node --version
npm --version
npx --version
```

---

## Step 5 — Install the validators and test runner

In your project directory:

```powershell
cd C:\Users\chase\Documents\Psyrcuit\course
npm init -y
npm install --save-dev html-validate @axe-core/cli @playwright/test
npx playwright install chromium
```

This puts:
- `html-validate` (HTML validation for the Stop hook)
- `@axe-core/cli` (accessibility audit for the Stop hook + a11y-auditor subagent)
- `@playwright/test` (test runner for the Stop hook + logic-verifier subagent)
- Chromium browser binary (Playwright needs this)

The `npx --no-install` flags inside the hooks rely on these being already installed, so this step is mandatory.

---

## Step 6 — Install Python (required for stop-gate.py)

```powershell
winget install Python.Python.3.12
```

Restart PowerShell. Verify:

```powershell
python --version
```

Should be 3.10 or newer. Older versions may not have all the JSON parsing features stop-gate.py uses.

---

## Step 7 — Make hooks executable (Git Bash)

The hook scripts are bash scripts and one Python script. They need execute permissions. From Git Bash (not PowerShell):

```bash
cd /c/Users/chase/Documents/Psyrcuit/course
chmod +x .claude/hooks/*.sh
chmod +x .claude/hooks/*.py
```

If you don't have Git Bash, you can run this from PowerShell with WSL, or just trust that Claude Code on Windows handles the executable bit transparently (it usually does, but `chmod +x` is the belt-and-suspenders move).

---

## Step 8 — Verify the setup with `claude doctor`

```powershell
cd C:\Users\chase\Documents\Psyrcuit\course
claude doctor
```

This should report:
- Claude Code version: v2.1.41 or newer
- Authentication: working (you'll need to log in with your Max 20x account)
- Project detected: yes (because CLAUDE.md is present)

If `claude doctor` reports authentication issues:

```powershell
claude logout
claude login
```

It'll open a browser to authenticate against your Max 20x subscription.

---

## Step 9 — Confirm Opus 4.7 is the default model

```powershell
claude
```

Then inside the Claude Code session, type:

```
/model
```

You should see Claude Opus 4.7 listed. If not:

```
/model claude-opus-4-7
```

(or whatever the exact model string is — `/model` will show available options).

---

## Step 10 — Test the Stop hook before kickoff

Still inside Claude Code:

```
echo "<html><body><h1>Test" > test.html
```

Then exit the session (Ctrl+C twice). The Stop hook should run html-validate against the malformed test.html and report a failure. If you see the hook output complaining about invalid HTML, the hook is wired correctly.

Clean up:

```powershell
Remove-Item test.html
```

If the Stop hook didn't fire, check `.claude/settings.json` is in the right place and the hook scripts are executable.

---

## Step 11 — You are ready to kick off

Open `KICKOFF_PROMPT.md`. Follow the 8 steps at the top of that file. Paste the prompt. Approve the plan. Watch it build.

---

## Troubleshooting

### "Claude Code seems to be ignoring CLAUDE.md"

CLAUDE.md must be in the project root, not in `.claude/`. The `/init` command auto-creates it in the right place; if you wrote it manually, double-check the location.

### "axe-core CLI fails to run"

```powershell
npm install --save-dev @axe-core/cli
```

If it still fails, run with verbose output:

```powershell
npx @axe-core/cli course.html --tags wcag2aa --verbose
```

### "Hooks aren't firing"

Check that `.claude/settings.json` exists and is valid JSON (no trailing commas). Run `claude doctor` to confirm Claude Code sees the project config.

### "Subagents aren't being invoked"

Subagent auto-routing is unreliable. The kickoff prompt explicitly instructs Claude to invoke them in parallel via the Agent tool — if Claude is skipping them, prompt it directly: "Run code-reviewer, a11y-auditor, logic-verifier, and content-sanity in parallel now."

### "I'm burning weekly Opus quota faster than expected"

Run `/usage` to check current burn. If you're past 20% inside the first session, stop and switch the 3 cheaper subagents to even lighter models (Haiku 4.5 instead of Sonnet 4.6) by editing the `model:` line in their YAML frontmatter.

If you hit the weekly cap mid-build, enable extra-usage billing in your Anthropic account settings (you'll be billed at standard API rates for the overage). Mid-build interruption is worse than the overage cost for a finite build.

### "Auto Mode keeps asking permission anyway"

Auto Mode classifier sometimes flags things as risky. Check `.claude/settings.json` `permissions.deny` block — if a command type is denied there, Auto Mode will still ask for the high-risk subset. This is intentional.

---

## What success looks like

After Phase 1 ships:

```
course/
├── course.html              ← exists, opens in browser, all systems work
├── PROGRESS.md              ← Claude wrote this with milestone log
├── DECISIONS.md             ← Claude wrote this with ADRs
├── README.md                ← Claude wrote this for the GitHub repo
├── tests/
│   ├── localStorage.spec.js
│   ├── keyboard-nav.spec.js
│   ├── cross-references.spec.js
│   └── gamification.spec.js
└── (everything else from setup)
```

All 8 acceptance criteria green. All 4 subagents PASS. Stop hook satisfied. You're ready to ship the preview launch.
