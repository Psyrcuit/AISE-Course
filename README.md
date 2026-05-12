# AISE 2026 Course

The map of everything a 2026 AI Solutions Engineer or Architect needs to know. 16 modules, 514 concepts, an interactive force-directed system map, gamified, offline-ready.

**Live:** [aise.psyrcuit.com](https://aise.psyrcuit.com)

## What it is

A single-page web app that teaches modern AI engineering as a navigable graph rather than a linear textbook. Every concept lives at its own URL, cross-references resolve at runtime, and progress is tracked locally so a learner can return to the same spot weeks later. Tools, playbooks, and decision frameworks are built into the surface, not separated into a wiki.

The pitch in one sentence: a textbook you can use as a daily-driver Swiss Army knife.

## Highlights

- **514 concept pages** across 16 modules, each with plain-language opener, architectural breakdown, worked example, common-failure list, and a copy-paste deep-dive prompt.
- **Force-directed System Map** of all 514 concepts with cross-reference edges, hue-by-module, focus-on-click. Plus a Canvas2D 3D variant.
- **8 working utilities** that demonstrate the concepts they teach: token counter, cost calculator, prompt linter, tokenizer playground, latency-budget calculator, JSON-Schema generator, system-prompt analyzer, resume-bullet generator.
- **Hybrid AI pattern.** Every AI-powered feature ships in two modes: rule-based heuristic (always on) and BYO-API-key mode (Anthropic or OpenAI direct from the browser, key encrypted with WebCrypto AES-GCM + PBKDF2). No backend.
- **Spaced repetition** flashcard mode (SM-2) plus quiz history, mock interview, and a unified `#/practice` hub.
- **Gamification** with 38 achievements, 8 tiers, XP, streak insurance, daily quests, and bitmap-encoded share URLs.
- **PWA**, offline-capable via service worker, installable.
- **5 theme variants** (dark / light / cyberpunk / sepia / high-contrast) wired through CSS custom properties.
- **Accessibility:** WCAG 2.2 AA target; aria-live announcements, roving tabindex on tablists, focus management on dialogs, full keyboard nav including the System Map canvas, `prefers-reduced-motion` honored.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Runtime | Vanilla ES2023, no framework | Single-file ethos; zero build step |
| Modules | Native `<script type="module">` | First-class browser support; clean tree-shake via lazy `import()` |
| Persistence | `localStorage` (namespace `aise26:`) | No backend, no PII, full export anytime |
| Styling | Vanilla CSS with custom properties | Theme variants without CSS-in-JS overhead |
| Visuals | Canvas2D + d3-force + force-graph | 514-node graph at 60fps |
| AI client | `fetch` direct to Anthropic / OpenAI | Browser-native; user supplies key |
| Encryption | WebCrypto AES-GCM (PBKDF2 100k) | Keys never stored in plaintext |
| Tests | Playwright (35 specs) + html-validate + axe-core | CI-checkable gauntlet |
| Deploy | Cloudflare Pages | Static, instant, global edge |

## Run locally

```bash
# 1. Install dev deps (Playwright, html-validate, axe-core)
npm install

# 2. Serve the static site on http://127.0.0.1:4173
node build/serve.mjs 4173

# 3. Run the test gauntlet
npx playwright test --reporter=line     # 35 specs
npx html-validate course.html
npx @axe-core/cli course.html --tags wcag2aa
```

No build step. Edit any file in `js/`, `styles/`, or `course.html` and refresh.

## Repo layout

```
course/
├── course.html              # entry point
├── manifest.webmanifest     # PWA install
├── service-worker.js        # offline shell
├── js/
│   ├── app.js               # boot
│   ├── runtime.js           # localStorage, settings, WebCrypto, aria-live
│   ├── router.js            # hash routes, lazy view loading
│   ├── data.js              # 514 concepts + 16 modules (stubs + metadata)
│   ├── fleshed.js           # 514 expanded concept pages
│   ├── flashcards.js, quizzes.js
│   ├── gam-data.js, gamification.js  # XP / tiers / achievements / streak
│   ├── srs.js               # SM-2 spaced repetition
│   ├── ai.js, heuristics.js # hybrid AI pattern
│   ├── crossref.js          # name -> slug resolver, linkifyText
│   ├── engine/              # force-graph integration
│   ├── views/               # one file per route
│   │   └── utility/         # 8 working utilities
│   └── components/          # reusable: tour, chat-sidebar, reader,
│                            #          annotate, heatmap, ...
├── styles/                  # tokens, base, layout, components, surfaces,
│                            # map, motion, print
├── fonts/                   # Geist + GeistMono variable (self-hosted)
├── vendor/                  # d3-force, force-graph (lazy-loaded)
└── tests/                   # 35 Playwright specs
```

## Architecture notes

- **No build step.** `course.html` loads `js/app.js` as an ES module; `app.js` registers routes; each route lazy-imports its view module. First paint touches a handful of files; the rest stream on demand.
- **One persistence layer.** `js/runtime.js` wraps `localStorage` with a namespaced `lsGet` / `lsSet` and exposes `apiKeySet/Get` that does WebCrypto encryption.
- **Cross-reference engine** (`js/crossref.js`) builds a name + alias index once. `linkifyText()` scans rendered prose and wraps any concept name match in an anchor. Dev-mode validator surfaces unresolved refs as a visible banner.
- **Hybrid AI pattern.** Every AI feature calls `aiOrFallback(aiFn, heuristicFn)`. If a key is connected and the call succeeds, the AI result returns; otherwise the heuristic runs. Both modes are always functional.
- **Gamification source of truth** is `GAMIFICATION.md`. The `XP_VALUES`, `TIERS`, and 20 original achievements in `js/gam-data.js` mirror it byte-for-byte; the logic-verifier subagent gates drift.

## Local data, zero telemetry

Everything a user generates - completion ticks, XP, streaks, notes, edited deep-dive prompts, builder drafts, annotation highlights, chat history, encrypted API keys - lives in their browser's `localStorage`. There is no backend, no analytics endpoint, no tracking pixel. A user can export the full library as Markdown or a portable ZIP at any time, and `#/settings → Data → Reset` clears every `aise26:` key with one confirm.

## Background

Built as a solo project to learn while teaching. The course covers what a 2026 AI Solutions Engineer or Architect actually does day-to-day: tokenization and embeddings, context engineering, agents and MCP, the Claude Code agent development kit, evaluation pipelines, voice agents, RAG production patterns, governance, and career strategy. Every concept page exists because the author had to learn it; every utility exists because it was the tool the author kept reaching for and not finding.

The build leaned heavily on Claude Code with a subagent gauntlet (`code-reviewer`, `a11y-auditor`, `logic-verifier`, `content-sanity`) running after each milestone. See `DESIGN.md`, `DECISIONS.md`, and `PROGRESS.md` for the build journal.

## License

MIT. Use the architecture, fork the content, take whatever's useful. If you ship something, a link back is appreciated but not required.

## Author

[Chase Lance](https://psyrcuit.com) - AI solutions consultant, Psyrcuit.
