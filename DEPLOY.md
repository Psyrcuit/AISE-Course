# Production deploy: aise.psyrcuit.com

Single-file-style static SPA with an ES module entry. No build step. Cloudflare Pages connected to `github.com/Psyrcuit/AISE-Course`; every push to `main` deploys.

## What to upload

```
aise.psyrcuit.com/
├── course.html              # entry point (12 KB)
├── manifest.webmanifest     # PWA install manifest
├── service-worker.js        # offline shell + caching
├── js/                      # 1.9 MB of ES modules (entry: js/app.js)
│   ├── app.js               # imported by course.html as <script type="module">
│   ├── runtime.js, router.js, data.js, ...
│   ├── views/               # route handlers
│   │   └── utility/         # toolkit utilities
│   ├── components/          # tour, heatmap, chat-sidebar, reader, annotate, ...
│   └── engine/              # force-graph 2D System Map
├── styles/                  # 124 KB CSS
│   ├── base.css, tokens.css, components.css, surfaces.css, ...
├── fonts/                   # 216 KB self-hosted Geist + GeistMono variable
│   ├── Geist-Variable.woff2
│   ├── Geist-Italic-Variable.woff2
│   └── GeistMono-Variable.woff2
└── vendor/                  # 188 KB lazy-loaded libs
    ├── d3-force.min.js
    └── force-graph.min.js
```

**Total: ~2.4 MB** on the wire (~600 KB gzipped). First paint loads only `course.html` + `app.js` + the rendered view's chunks (router lazy-imports each view).

## What NOT to upload

- `_archive/` — dev scripts, planning docs, legacy course versions
- `node_modules/` — dev dependencies only (html-validate, axe-core, Playwright)
- `tests/`, `test-results/`, `playwright.config.js` — test infrastructure
- `build/` — local dev server
- `*.md` at project root — CLAUDE.md, SPEC.md, CONTENT.md, GAMIFICATION.md, DESIGN.md, DECISIONS.md, PROGRESS.md, SETUP.md, README.md, DEPLOY.md
- `.claude/` — Claude Code configuration
- `package.json`, `package-lock.json`, `.gitattributes`

## Server requirements

| Need | Why |
|---|---|
| Serve `course.html` (or copy/rename to `index.html`) | Entry point |
| `Content-Type: application/javascript` on `.js` | ES modules require correct MIME |
| `Content-Type: text/css` on `.css` | Style imports |
| `Content-Type: font/woff2` on `.woff2` | Font loading |
| `Content-Type: application/manifest+json` on `.webmanifest` | PWA install |
| HTTPS | Service workers require it; clipboard API too |
| Long-lived cache on `js/`, `styles/`, `fonts/`, `vendor/` | Assets are content-addressed by path, not hashed; bump `cache-bust=v9` query in `course.html` when shipping a content change |
| No-cache on `course.html` + `service-worker.js` | These two pull fresh content |
| Optional gzip / Brotli | ~3-4× reduction on JS/CSS |

## Cloudflare Pages setup (current)

- Repo: `github.com/Psyrcuit/AISE-Course`
- Pages project: `aise-course`
- Branch: `main` (auto-deploys on push)
- Build command: *empty* (no build step)
- Build output directory: `/`
- Custom domain: `aise.psyrcuit.com` (CNAME auto-managed by Cloudflare)
- Auto-serves `course.html` at the domain root.

## Asset paths

All asset paths in `course.html` are relative (`./js/app.js`, `./styles/*.css`), so the same files work from `file://`, any subdomain, or any subpath. Hash-based routing (`#/path`, `#/concept/...`) is server-agnostic — no rewrite rules needed.

## Service worker scope

`service-worker.js` registers with scope `./` (the deploy directory). It precaches the shell on install and serves cached responses for repeat visits. To roll a content update:

1. Edit `service-worker.js`: bump the `CACHE` version string (e.g., `aise26-v9` → `aise26-v10`).
2. Redeploy. Existing visitors will fetch the new worker on next load; old caches are pruned on activation.

## Smoke test on production

After deploy, open `https://aise.psyrcuit.com` in an incognito window and verify:

1. Reveal cinematic plays, "Enter" routes to `#/onboarding` (or `#/` if already seen).
2. Cmd/Ctrl+K opens the command palette.
3. `#/map` renders the 514-node force-directed System Map.
4. `#/concept/retrieval-augmented-generation-rag` opens with all sections rendered.
5. Settings page (`#/settings`) shows 5 tabs including API key.
6. Theme switcher cycles dark/light/cyberpunk/sepia/high-contrast.
7. PWA install prompt appears in Chrome address bar.
8. DevTools → Application → Service Workers → status: activated and running.

## Roll-back

The previous `course.html` lives at `_archive/misc/course.html.legacy` (single-file pre-modularization v2 build, 477 KB). If anything goes sideways, redeploy that one file and remove the `js/`, `styles/`, `fonts/`, `vendor/` directories.

## Last audited

- All 35 Playwright tests pass (`npx playwright test`).
- code-reviewer / a11y-auditor / logic-verifier / content-sanity subagent gauntlet: PASS after fixes 2026-05-11.
- localStorage namespace `aise26:`. No PII collected. No network calls except the optional BYO API key feature (Anthropic + OpenAI direct browser).
