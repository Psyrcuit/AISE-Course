# AI Solutions Engineer / Architect 2026 Course — Build Rules

## Project intent

Single-file HTML course teaching everything a 2026 AI Solutions Engineer / Architect needs to know. ~10k+ lines, ~390 glossary stubs across 16 modules, gamification (XP, badges, streaks), 3-modality Toolkit (templates + generator prompts + builder widgets), Playbook framework, Decision tools, Editor pattern, Personal Library, dark mode, keyboard nav, search, cross-reference engine. Delivered as ONE self-contained `course.html` with no build step and no external runtime dependencies beyond fonts and (optionally) one CDN-pinned syntax-highlight library.

## Architecture invariants (DO NOT VIOLATE)

- One file. All CSS in `<style>`. All JS in one `<script type="module">`.
- localStorage is the ONLY persistence layer. Namespace all keys `aise26:`.
- No frameworks. No build step. Vanilla ES2023 JS.
- Every interactive element MUST be reachable via keyboard.
- Every cross-reference MUST resolve at runtime. Dangling refs are a BLOCKER.
- Tailwind violet-500 design system. No alternate palettes mid-build.
- No em dashes anywhere in body copy or generated content.

## Repo map

- `course.html` — the deliverable
- `SPEC.md` — full Phase 1 requirements (READ ON SESSION START)
- `CONTENT.md` — 390-stub glossary source of truth (READ ON SESSION START)
- `GAMIFICATION.md` — XP, badge, streak, tier formulas (READ ON SESSION START)
- `PROGRESS.md` — milestone state, written before any compaction
- `DECISIONS.md` — ADR-style log of non-obvious calls made during build
- `.claude/agents/*.md` — 4 review subagents
- `.claude/hooks/*` — Stop, PostToolUse, PreToolUse, SubagentStop handlers
- `.claude/settings.json` — hook + permission config
- `tests/` — Playwright + axe-core specs

## Subagents (delegate aggressively, do not inline this work)

- `code-reviewer` — runs after every meaningful change to course.html
- `a11y-auditor` — runs after any DOM/CSS change
- `logic-verifier` — runs after any localStorage/gamification/cross-ref change
- `content-sanity` — runs after any glossary/copy change

After every meaningful milestone, invoke all 4 in parallel via the Agent tool. Block on their feedback before proceeding.

## Stop conditions (you are NOT done until ALL pass)

1. PostToolUse lint hook exits 0 on every saved file
2. Stop hook validators pass: html-validate clean, axe-core zero serious/critical, Playwright green
3. All 4 subagents return PASS on the final artifact
4. Lighthouse a11y score >= 95
5. localStorage round-trips XP, badges, streaks across reload
6. All cross-reference links resolve to existing anchors

## Voice and style

Crisp, technical, Stripe-Press-meets-textbook. No emojis in body copy. No "Let me explain..." preamble. No filler praise. Show, don't narrate. Plain hyphens, never em dashes.

## Security

- NEVER add network calls except CDN font/highlight library imports
- NEVER use `eval` or `new Function` on user input
- NEVER write to disk outside the project root
- NEVER commit secrets, API keys, or environment files

## Operating mode

- Auto Mode is active. Do not ask permission for routine work.
- Effort: xhigh (default for Opus 4.7 in Claude Code).
- Adaptive thinking is on.
- Token budget hint per major iteration: ~80k.
- Context-management: do NOT compact until 75-80% full. Save state to PROGRESS.md and DECISIONS.md before any compaction.
- If you approach a token budget limit, finish the current milestone and save state. Never stop mid-milestone.
- When you hit ambiguity, make the most defensible choice, write it down in `course.html` as a comment block tagged `// ASSUMPTION:`, log it in DECISIONS.md, and continue.
