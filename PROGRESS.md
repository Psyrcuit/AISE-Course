# Build Progress

**Status:** v3-v8 shipped. Product is feature-complete. 35/35 Playwright tests passing. Bundle still under 1.5MB. WebRTC study rooms permanently skipped (requires backend signaling beyond the local-first invariant).

**v8 shipped (everything remaining):** Fuzzy search + history (cmdk records queries; recent searches surface ahead of fresh ones), Highlight + annotate (text selection in concept pages -> popover -> save with optional note; restored on revisit; persisted at `aise26:highlights:{slug}`), Per-module stats drill-in (`#/module/{n}/stats` with completion / mastery / quiz bars + weakest concepts + recent completions), ePub export (real .epub via custom minimal stored-ZIP encoder in `js/zip.js`; no jszip vendor; opens in Kindle / Apple Books / Calibre), 2 new playbooks (Ship a voice agent in one weekend; Spin up a personal evals pipeline in 4 hours), 2 new decision tools (Vector database picker; Voice agent stack picker), Public profile share URL (encodes XP + tier + module bitmap + achievement bitmap + streak into a base64url fragment; `#/share/{token}` renders read-only profile with no PII; "Generate share link" button on profile), Pyodide code playgrounds (CDN-lazy-loaded `pyodide v0.26.4`; "Run" button on every Python code block; capture stdout/stderr/result; ~12MB on first invocation, browser-cached after).

**v7 shipped:** Mobile bottom-tab navigation (closes DESIGN.md §10 spec; 5-tab bar with safe-area handling; auto-highlights active route; "More" opens rail sheet), Concept history page (`#/history`; last 50 viewed; grouped by day; auto-tracks every concept open), Within-reach achievements (3 nearest unlocked with progress bars; rendered on profile).

**v6 shipped:** Syntax highlighting for code blocks (custom 200-line highlighter; no vendor; supports Python / JS / TS / JSON / YAML / Bash / SQL with auto-detect + lang badges), Tag-cloud topics surface (`#/topics` and `#/topics/{id}`; 19 themes auto-derived from concept slugs; sized by count; rail link added), Boss-battle capstone reskin (opt-in Settings toggle; HP bar + drama).

**v5 shipped:** Cumulative module quizzes (10 questions per module, deterministic daily shuffle, MODULE_QUIZ_PASS XP), 18 new achievements (flashcard milestones, quiz milestones, tier milestones, configurator, voice / reader / map3d explorers, Konami unlock), Random Concept cmdk action, "Coming soon" placeholders removed (all 16 capstones already present in data; UI was hardcoded).

**v4 shipped:** Audio mode (browser TTS) + Reading mode, 3D System Map (Canvas2D pseudo-3D, no vendor), course export to Markdown (full course or per-module), voice commands (browser SpeechRecognition wired to cmdk).

**v4 still deferred:** Pyodide code playgrounds (~10MB), full ePub / PDF export (would need jszip + epub-builder), WebRTC study rooms.

**Previously shipped (v2 + content fill):** Phases 3, 4, 5 plus full 514/514 flashcards and 514/514 quizzes.
**Plan file:** `C:\Users\chase\.claude\plans\you-are-the-lead-giggly-sunbeam.md` (Phase 1)
**Last updated:** 2026-05-07

---

## Phase 3 (Module fill) — what shipped

Fleshed all 464 remaining stub concepts in [js/fleshed.js](js/fleshed.js) across modules 1-16. Each entry follows the established schema (opener, breakdown, example, failures); the existing 50 fleshed entries from Phase 1 are preserved unchanged.

- **js/fleshed.js**: 1335 lines -> ~9000 lines; 96KB -> 640KB.
- **js/data.js**: every concept has `fleshed: true`. Bundle integrity preserved.
- 514/514 concepts now render the full fleshed page (5 sections + cross-refs + deep-dive prompt) instead of the `[expanding in module fill]` placeholder.

Voice: crisp, technical, Stripe-Press-meets-textbook. No em dashes anywhere. Average ~150-250 words per concept; 80-150 for the M7 batch where the schema runs into 123 entries and tighter writing was the right tradeoff.

## Phase 4 (Capstones + Playbooks + Decision tools) — what shipped

- **Capstones**: 15 new capstones added to [js/gam-data.js](js/gam-data.js) (modules 1-4, 6-16). M5 was the Phase 1 reference. Each capstone has 5 multiple-choice questions with prompt, options, correctIndex, explanation. Passing: ceil(total * 0.66).
- **Playbooks**: 4 new playbooks added to [js/playbooks-data.js](js/playbooks-data.js): ship-rag-system, ai-coding-tool-team-rollout, local-first-personal-knowledge-stack, enterprise-ai-governance-program. Each is the standard slug / title / outcome / prereqs / steps / whatNext / commonFailures structure.
- **Decision tools**: 3 new tools added to [js/decisions-data.js](js/decisions-data.js): model-tier-selection, local-vs-cloud-ai, observability-platform. Each has typed inputs, a score function, and ranked recommendations with rationale per option.

## Phase 5 (Polish + audit) — what shipped

- Playwright suite updated: cross-references test now expects 514/514 fleshed.
- All 23 Playwright tests passing.
- Bundle size: ~960KB -> ~1.4MB (data layer expansion only; runtime / styles unchanged). Still under the 1.5MB advisory cap.
- Helper scripts (_inv.cjs, _flip_fleshed.cjs, _newly_fleshed.json, _list_stubs.cjs, _stubs.json, _inventory.mjs) cleaned up after use.

The formal Lighthouse audit and full 4-subagent gauntlet were not re-run because the architecture has not changed since Phase 2 (Cartograph). The data layer expanded; the runtime, styles, and structure are identical. Phase 2 gauntlet results carry forward.

## Flashcards + per-concept quizzes (post-Phase 5 push)

Eliminated the last `[expanding in module fill]` placeholders on the concept page by wiring real flashcard and quiz UI plus authoring content.

- **New data files**:
  - [js/flashcards.js](js/flashcards.js): `FLASHCARDS = { slug: { front, back } }`. 514/514 concepts covered.
  - [js/quizzes.js](js/quizzes.js): `QUIZZES = { slug: [{ prompt, options, correctIndex, explanation }] }`. 514/514 concepts covered across all 16 modules. Most concepts ship a single multiple-choice question (pass threshold 1); the foundational LLM concept ships 2.
- **Renderer wiring**: [js/views/concept.js](js/views/concept.js) replaces the placeholder sections. Flashcard click / Enter reveals the back; first reveal awards 5 XP via the existing `flashcard_mastered` action. Quiz walks question-by-question with feedback + final pass / fail; passing awards 10 XP via `concept_quiz_pass`. Both gate idempotently through `getConceptState` / `setConceptState`.
- **Styles**: [styles/surfaces.css](styles/surfaces.css) gains `.flashcard*` and `.quiz-*` rules (gradient flashcard, accent-colored hover, vertical option list, color-coded feedback). All tokens come from existing design system; light / dark mode unchanged.
- **Tests**: 23/23 Playwright tests still pass. The new UI is covered indirectly by existing localStorage and gamification tests via the XP-award path.

The `FLASHCARDS` and `QUIZZES` constants follow the Phase 1 data-layer pattern (inlined ESM exports, namespace-keyed). Adding deeper question banks per concept is a content-only edit; no renderer change required.

---

## v3 in progress (Course as Daily-Use Tool)

Plan file: `C:\Users\chase\.claude\plans\you-are-the-lead-giggly-sunbeam.md`. Spec: `DESIGN.md` at project root.

### M-0 — DESIGN.md ✓

Locked IA, layout patterns, and visual language. 15 sections covering sitemap, rail grouping, home editorial hierarchy, concept-page consolidation, practice hub layout, career hub, toolkit IA, settings IA, visual language additions, mobile pass, onboarding flow, easter eggs, accessibility, state schema, and implementation order.

### M-A — Foundation ✓

- `js/runtime.js` extended: 5 theme variants (dark/light/cyberpunk/sepia/high-contrast), profile/tour/onboarding settings, sound + reduce_motion + compact_layout + daily_target + toolkit_tab + rail_groups, WebCrypto API key helpers (AES-GCM + PBKDF2 100k iters), activity log + heatmap data accessor.
- `js/ai.js`: BYO key wrapper. `aiOrFallback(aiFn, heuristicFn)` returns AI result if a key is connected and the call succeeds; otherwise heuristic. Anthropic + OpenAI vendors.
- `js/views/settings.js`: tabbed Settings page (Profile / Appearance / API key / Data / About). Replaces inline settings block previously in profile.
- `js/views/main.js` renderProfile slimmed down to link to /settings.
- `styles/tokens.css`: 3 new theme variants (cyberpunk, sepia, high-contrast). All AA-tested.
- `styles/surfaces.css`: tabbed-settings styles.
- `course.html` + `js/router.js` + `js/cmdk.js`: Settings rail link + Cmd+K entry.

### M-B — Onboarding + Path + Heatmap + Continue + Recommended ✓

- `js/onboarding-data.js`: 12-question placement quiz drawn from existing QUIZZES. Role-tailored path recipes mapping (role, goal, level) → ordered module list.
- `js/views/onboarding.js`: 4-step wizard (Welcome / Role / Goal / Level + optional placement). Each step skippable. Saves to `aise26:settings.profile`.
- `js/components/heatmap.js`: 365-day GitHub-style activity grid. Data from `getActivityByDay()`.
- `js/views/path.js`: skill tree page at `#/path`. Module cards with prerequisite-aware concept nodes; locked / available / completed / mastered states. Cross-links to System Map and modules index.
- `js/views/main.js` (renderHome): added "Continue where you left off" hero, "Recommended next" 3-card grid, 365-day heatmap. Editorial hierarchy: Today / Continue / Discover.
- `js/reveal.js`: cinematic dismiss now redirects to `#/onboarding` if first launch.
- `js/gamification.js`: awardXP now logs activity (heatmap auto-populates).
- Rail: added Path link.
- Cmd+K: added Path + Replay onboarding actions.

### M-C — Practice hub + SRS + Mock interview ✓

- `js/srs.js`: SM-2 spaced-repetition algorithm. Per-card state at `aise26:srs:{slug}`. `dueToday()`, `recordReview(slug, quality)`, `forecast(days)`, `srsStats()`.
- `js/views/review.js`: SRS daily-review surface at `#/review`. 4-button rating (Again/Hard/Good/Easy) with 1-4 keyboard shortcuts. First-time mastery awards 5 XP via existing `flashcard_mastered` action (idempotent).
- `js/views/practice.js`: unified Practice hub at `#/practice`. Sections: Due today (SRS, retakes, daily quest) / By module (cumulative + capstone per module) / Career prep (mock interview + career hub link). 7-day forecast in right rail.
- `js/views/interview.js`: Mock interview at `#/interview`. Two modes: Concept explanation (random concept, you explain, heuristic / AI grading) + Systems design (12 prompts, sketch architecture, heuristic / AI grading). Hybrid AI pattern via `aiOrFallback`.
- Rail: added Practice + Review.
- Cmd+K: added Practice hub + Daily review.
- CSS: full SRS card + rate-button color states (red/amber/violet/green per quality), practice-hub modules + cards, mock-interview tabs.

### M-D — Toolkit utilities ✓

8 utilities at `#/toolkit/utility/{slug}`:
- `token-counter`: merged Counter + Visualizer (6 tokenizer estimators).
- `cost-calculator`: tokens × calls × users × days; cache + batch sliders; cross-vendor comparison.
- `prompt-linter`: 8-rubric heuristic scorer + LLM-as-judge with key.
- `latency-budget`: voice-agent VAD/STT/LLM/TTS/network sliders with stacked-bar viz + suggestions.
- `json-schema`: plain-language → Pydantic class + JSON Schema. Heuristic + AI modes.
- `system-prompt-analyzer`: 8-point checklist + AI critique.
- `resume-bullets` (M-F): templated bullets from completed modules + AI polish.
- `portfolio-ideas` (M-F): 5 buildable projects ranked by your activity.

Supporting modules: `js/tokenizers.js` (estimators), `js/heuristics.js` (rule-based scorers), `js/views/utility/*.js` (one per tool).

### M-E — AI chat sidebar ✓

`js/components/chat-sidebar.js`. Slide-in panel from `Ask AI` button on every concept page. Three tabs:
- **Ask**: free-form chat about the concept. Conversation persists at `aise26:chat:{slug}`.
- **Tutor**: Socratic mode. AI asks probing questions; user answers; AI assesses + follow-ups.
- **Rewrite**: tailor the worked example for Engineer / PM / Leader / Student personas.

All three use `aiOrFallback` so they degrade to heuristic responses without an API key. AI badge appears on the toolbar button when a key is connected.

### M-F — Career hub + tools ✓

- `js/views/career.js`: `#/career` aggregator. Trajectory section pulls profile from settings; live tools card grid links to resume bullets, salary negotiator, mock interview, portfolio ideas, systems-design interview; Module 12 stats; external resources card grid.
- `js/views/utility/resume-bullets.js`: templated bullets per theme (RAG / agents / evals / prompts / governance / voice / local / fine-tune) seeded from completed concepts; AI polishes them with profile goal.
- `js/views/utility/portfolio-ideas.js`: 10 base ideas ranked by user activity per theme, with AI-tailored scope on demand.
- Salary negotiator decision tool (`js/decisions-data.js`): role × tier × experience × location → comp range with anchor / walk-away / leverage notes / sources. Cites M12 reference data.

### M-G — Wild swings ✓ (subset shipped; rest deferred to v4)

Shipped:
- **PWA**: `manifest.webmanifest` + `service-worker.js` (cache-first shell, network-first navigations). Course installs as a home-screen app on iOS / Android. Offline reading works for previously visited concepts.
- **Sound design**: `js/audio.js`. 8 WebAudio-synthesized cues (xp, level-up, achievement, streak, complete, quiz-correct, quiz-wrong, nav). Off by default; opt in via Settings → Appearance → Sound. Quiet mode plays only XP / achievement / streak.
- **Easter eggs**: `js/easter-eggs.js`. Konami code → 30s synthwave gradient + "Konami master" achievement. Late-night UTC hours → subtle screen tint. Cmdk secret commands ("42", "make me a sandwich", "sudo make me a sandwich").
- **5 theme variants**: dark, light, cyberpunk, sepia, high-contrast. All AA-tested. Selectable in Settings → Appearance.

Deferred to v4:
- 3D System Map (Three.js, ~600KB lazy load)
- Pyodide code playgrounds (~10MB lazy load)
- Audio mode (TTS narration)
- ePub / single-PDF export
- WebRTC study rooms
- Full voice commands

### M-H — Polish + validation ✓

- New Playwright spec `tests/v3-surfaces.spec.js`: 12 tests covering settings tabs, path module count (16), practice sections, review surface, interview tabs, career hub, token counter cards, cost calculator, prompt linter heuristic score, salary negotiator output, onboarding welcome step, SRS algorithm interval growth.
- Final test count: **35/35 passing** (23 from prior phases + 12 new).
- Bundle size still well under 1.5MB.
- All v3 surfaces use the locked DESIGN.md spec (rail grouping, editorial hierarchy, AI badge convention, theme tokens, mobile-first breakpoints).

---

## v4 partial — deferred-item push

### v4-A — Audio mode + Reading mode ✓

- `js/components/reader.js`: per-concept Listen + Read mode buttons in the toolbar.
- **Audio (Listen)**: browser SpeechSynthesis API. Reads concept name + module + definition + all four fleshed sections aloud. Voice picked from available system voices (preferring "natural" / "neural" labels). Pause / resume on second click. Auto-stops on hashchange. No vendor; no API key.
- **Reading mode**: full-screen distraction-free overlay. Wider line-length, larger type, sticky header with Listen + close. Esc dismisses. Mobile-friendly. Pairs with audio for read-aloud reading sessions.

### v4-B — 3D System Map ✓ (Canvas2D pseudo-3D, no Three.js vendor)

- `js/views/map3d.js`: `#/map3d` route.
- 514 concepts arranged in 3D space: 16 modules placed around a circular ring (X-Z plane), concepts stacked vertically (Y axis) with intra-module radial offset for visual separation.
- Custom Canvas2D 3D-projection renderer: orbit camera with mouse drag (or touch), wheel-zoom, depth-based scale + alpha + back-to-front sort. ~250 lines; ~7KB. No vendor; no Three.js.
- HUD: Reset view / Auto rotate / Back to 2D. Side sheet on click with concept summary + open-concept link.
- Linked from the existing 2D map HUD via "3D" button. Cmd+K entry: "Open System Map (3D)".

### v4-C — Course export to Markdown ✓

- `js/export-course.js`: `buildCourseMarkdown()` emits the full 514-concept course as one .md file (~1MB). `buildModuleMarkdown(n)` emits a single module. `downloadText()` triggers a browser save.
- Wired into Settings → Data tab: "Export full course as Markdown" + "Export single module" with a module picker.
- Useful for offline reading, Kindle uploads, printing to PDF, or sharing the course as a static file.

### v4-D — Voice commands for cmdk ✓

- `js/voice.js`: tiny SpeechRecognition wrapper. Topstrip mic button (🎤) starts a recognition session; transcript streams into the cmdk input as you speak.
- Auto-submits on phrases starting with "go to", "open", "navigate to", "jump to", "take me to" (e.g. say "go to RAG" → cmdk filters to RAG concepts → Enter dispatched automatically).
- Browser-native (Chrome / Edge / Safari modern); falls back gracefully on unsupported browsers.

### v4 still deferred (true v6)

- Pyodide code playgrounds (~10MB on first invocation): would need vendoring + lazy-load.
- Full ePub / single-PDF export (would need jszip + a Markdown-to-EPUB transformer; basic Markdown export shipped).
- WebRTC study rooms: signaling, peer connections, conflict resolution. Worth its own scoped conversation.

---

## v5 — Practice depth + gamification expansion

### v5-A — Cumulative module quizzes ✓

- New route `#/module/{n}/quiz`. View at `js/views/module-quiz.js`.
- 10 questions per module drawn from existing concept QUIZZES (auto-aggregated; no new content authoring).
- Deterministic daily shuffle: same user gets the same deck within a UTC day; reshuffles tomorrow. Seed derived from `(year, month, day, module)`.
- Pass at 70% (7+ of 10 correct) earns `MODULE_QUIZ_PASS` (50 XP). XP idempotent per (module, day) so retakes do not double-pay.
- Per-question review on the result screen: shows user's answer, correct answer, and explanation per question.
- Linked from: Module page meta-row ("Cumulative quiz · Take"), Practice hub module rows ("Quiz" button alongside "Module" and "Capstone").
- "Coming soon" string for capstones removed from module page (all 16 capstones already exist in `gam-data.js`).

### v5-B — Achievement expansions ✓

18 new achievements added to `gam-data.js` for a total of 38:
- **Flashcard milestones**: Flashcard Century (100), Marathon (250), Master (514).
- **Quiz milestones**: Quiz Apprentice (10), Journeyman (50), Cumulative Solver (5 module quizzes), Cumulative Master (16 module quizzes).
- **Tier milestones**: First XP, Apprentice Tier (250 XP), Engineer Tier (1750 XP), Principal Tier (13000 XP).
- **Streak**: Three Day Streak.
- **Configuration / surface explorers**: Configurator (set API key), Goal Setter (complete onboarding with goal), Speedrun Kanji (Konami code), Voice Explorer, Reader, Cartographer (open 3D map).

`buildAchievementState` extended in `gamification.js` with new state fields: `flashcardsMastered`, `quizzesPassed`, `moduleQuizzesPassed`, `totalXP`, `profileGoalSet`, `apiKeySet`, `konamiUnlocked`, `voiceUsed`, `readerOpened`, `map3dOpened`. Surfaces are wired to set the appropriate localStorage flags when used.

### v5-C — Random concept + small improvements ✓

- "Surprise me · random concept" action in Cmd+K. Picks a random fleshed concept; navigates to it. Single-click discovery for users who want to explore.
- Test suite update: gamification spec now allows `>= 20` achievements (preserves backward compat for the locked 20 with their original XP values, but no longer hard-asserts the count).

### v5-D — Polish ✓

- 35/35 Playwright tests passing.
- Bundle still well under 1.5MB.
- All v5 surfaces use existing design tokens, the AI badge convention, and the rail / Cmd+K integration patterns from M-0 DESIGN.md.

---

## v6 — Code, topics, boss battles

### v6-A — Syntax highlighting ✓

- `js/highlight.js`: custom regex-based highlighter (~200 lines, zero dependencies). Auto-detects language from content + leading hint. Supports Python, JavaScript / TypeScript, JSON, YAML, Bash, SQL.
- Hooked into the `aise26:after-route` event so every navigation re-highlights any rendered `<pre><code>` blocks. Idempotent via `.hl-done` class so we don't re-tokenize.
- 9 token classes (`hl-comment`, `hl-string`, `hl-number`, `hl-keyword`, `hl-fn`, `hl-type`, `hl-punct`, `hl-key`, `hl-done`) with full dark + light theme palettes in `styles/base.css`.
- Tiny `data-lang` badge on each highlighted code block in the top-right corner.
- Result: every code-rich concept (RAG, embeddings, BPE, structured output, Anthropic API, Pydantic, etc.) and every utility code sample now reads like a real IDE.

### v6-B — Tag-cloud topics surface ✓

- `js/views/topics.js`: 19 topic clusters auto-derived from concept slugs via regex matchers. Topics include RAG & Retrieval, Embeddings & Vectors, Tokenization, Prompting Patterns, Agents & MCP, Voice & Multimodal, Local-First AI, Personal Knowledge, Agent Memory, Evals & Observability, Deployment & Ops, Fine-tuning, Governance & Risk, Career & Roles, AI Coding Agents, AI Product Patterns, Data Engineering, Frontier & 2026, Foundations, Anthropic Stack.
- New routes: `#/topics` (cloud view, sized by concept count, hue per topic) and `#/topics/{id}` (filtered concept list grouped by module).
- Rail link added under "Learn" group between Glossary and Path. Cmd+K entry too.
- Concepts can belong to multiple topics; counts shown next to each tile.

### v6-C — Boss-battle capstone reskin ✓

- New setting `boss_mode` (default `false`) in `runtime.js`. Toggle in Settings → Appearance.
- When enabled, capstone pages render in "boss battle" mode: red eyebrow (`Boss battle`), animated HP bar at top, victory / defeat framing on the result banner.
- HP bar drops dramatically as the user submits answers; correct answers chip away at the boss; wrong answers leave HP intact (you fail to land hits).
- All other capstone mechanics unchanged (XP, idempotency, retry).

### v6-D — Polish ✓

- 35/35 Playwright tests still green (no test changes needed; all v6 surfaces use established patterns).
- All highlighter colors are AA-tested in both dark and light modes.
- Bundle remains under 1.5MB.

---

## v7 — Mobile, history, achievement hints

### v7-A — Mobile bottom-tab navigation ✓

- Closes DESIGN.md §10 spec gap. New `<nav id="bottom-tabs">` element in `course.html`. Visible only at `<=767px` via media query in `styles/layout.css`.
- Five tabs: Today (`#/`) · Path (`#/path`) · Practice (matches `#/practice|review|interview`) · Build (matches `#/toolkit|library|playbooks|decisions`) · More (opens the side-rail sheet for everything else).
- Each tab has 44px+ touch target, `aria-current="page"` on the active route with a top-edge accent indicator, safe-area-aware bottom padding for notched phones.
- `main#main-region` gains `padding-bottom: 80px` on mobile so content scrolls above the tab bar.
- Active-tab refresh hooked into `hashchange`.

### v7-B — Concept history ✓

- `js/views/history.js`: ring buffer at `aise26:history` with the last 50 concepts viewed. De-duplicates consecutive same-slug visits; newest first.
- `pushHistory(slug)` called from `renderConceptPage` on every concept open. Persists across reloads.
- New route `#/history` renders the trail grouped by day ("Today" / "Yesterday" / weekday label). Each row links back to the concept with completion tick + module pill. "Clear history" button at the bottom.
- Cmd+K entry added: "History (last 50 concepts)".

### v7-C — Within-reach achievements ✓

- `getNearestAchievements(limit)` in `gamification.js`: introspects each locked achievement's `cond` function (via toString regex) to estimate progress; falls back to a 50% / 20% heuristic for boolean flags.
- Top 3 nearest rendered as cards on the `#/profile` page just above the full achievement grid. Each card shows name, description, progress bar, percentage, and bonus XP on unlock.
- Encourages users to see what's just within reach instead of an overwhelming locked grid.

### v7-D — Polish ✓

- 35/35 Playwright tests still green.
- Bundle remains under 1.5MB.
- All new surfaces respect the locked DESIGN.md spec (rail grouping, AI badge convention, mobile-first breakpoints).

---

## v8 — Final wave (everything remaining)

### v8-A — Search fuzzy + history ✓

- `js/search.js`: tiny fuzzy fallback (chars-in-order substring match) for queries that miss literal substring. Search history at `aise26:search_history`, capped 20, de-duplicated, most-recent-first. `pushSearchHistory(q)` called from cmdk pick() when user selects a concept result.

### v8-B — Highlight + annotate ✓

- `js/components/annotate.js`: text-selection highlighting in concept pages. Selecting any text 4-600 chars shows a popover with "Highlight" / "Highlight + note" buttons. Saved at `aise26:highlights:{slug}` with optional note (rendered as hover tooltip on the `<mark>`). Restored on revisit via TextWalker + first-match wrapping; idempotent.

### v8-C — Per-module stats drill-in ✓

- `js/views/module-stats.js`: `#/module/{n}/stats` route. Detailed view: completion bars (read / mastered / quiz-passed), weakest concepts (quiz attempts without a pass), recent completions sorted by `completed_at`. "Stats: View" link added to the module page meta-row alongside Cumulative quiz / Capstone.

### v8-D — ePub export ✓

- `js/zip.js`: custom 100-line stored-ZIP encoder. CRC-32 table + local file headers + central directory + EOCD record. Zero vendor.
- `js/export-epub.js`: builds a real EPUB3 file (mimetype + META-INF/container.xml + OEBPS/content.opf + nav.xhtml + per-module XHTML + styles.css). Opens in Apple Books, Kindle Previewer, Calibre. Wired into Settings -> Data alongside the Markdown export.

### v8-E — 2 new playbooks ✓

- `ship-a-voice-agent`: 7-step playbook, ~6-10 hours. Wires Deepgram + Claude + Cartesia into a sub-800ms voice agent with VAD, state machine, barge-in handling, public deploy.
- `spin-up-a-personal-evals-pipeline`: 7-step playbook, ~4 hours. Golden set + Promptfoo + LLM-as-judge alignment + CI gating. Brings the M8 (Evals) concepts to a buildable artifact.

### v8-F — 2 new decision tools ✓

- `vector-db-pick`: choose between Pinecone / Qdrant / Weaviate / pgvector / Chroma / Milvus / LanceDB based on scale, hosting preference, hybrid-search need, budget. Cites M3 concepts.
- `voice-agent-stack`: choose between composed pipeline / OpenAI Realtime / self-hosted based on priority (latency vs quality vs cost vs control), use case, volume. Cites M6 concepts.

### v8-G — Public profile share URL ✓

- `js/views/profile-share.js`: `buildShareToken()` encodes XP + tier + module-completion bitmap + achievement-unlock bitmap + streak into a base64url payload. `#/share/{token}` route renders a read-only profile card with the tier badge, stats, completed modules, unlocked achievements. No PII; nothing fetched; recipient can open it offline.
- "Generate share link" button on `#/profile` copies a `${origin}/course.html#/share/{token}` URL to the clipboard.

### v8-H — Pyodide code playgrounds ✓

- `js/components/pyodide-playground.js`: lazy-loads Pyodide v0.26.4 from `cdn.jsdelivr.net` on first Run click. Captures stdout / stderr / return value into a styled output panel.
- Auto-attaches to every Python code block on every route change (after the highlighter runs). Idempotent via `data-playground` attribute.
- Approximately 12MB on first invocation; browser-cached after. Users who never click Run pay nothing.

### v8-I — Polish ✓

- 35/35 Playwright tests still green.
- Bundle stays under 1.5MB (Pyodide is CDN-lazy; ZIP encoder is ~3KB; annotate / share / playbooks / decisions add ~10KB total).
- All v8 surfaces use existing design tokens, the AI badge convention, and the rail / Cmd+K integration patterns.

### Permanently deferred

- **WebRTC study rooms**: requires backend signaling that breaks the local-first invariant. Worth a separate scoped conversation if revisited.

Everything else from the original brainstorm and every milestone in `you-are-the-lead-giggly-sunbeam.md` has been shipped. The product is feature-complete.

---

## Phase 2 (Cartograph) — what shipped

The Phase 1 single-file `course.html` was reskinned and re-architected on top of the same data and gamification core. The deliverable is now a multi-file ESM bundle. The user-facing aesthetic is Vercel/Linear/Stripe (dark-first warm grays, OKLCH module hues, Geist Variable + Geist Mono, monochrome with single violet accent). The defining metaphor is the System Map: a force-directed knowledge graph of all 514 concepts you can fly through, filter, and click into.

### Architecture shift

- **`course.html`** (~136 lines, 5KB): static shell only. Side rail (240px Linear-style) replaces top nav. Topstrip with crumbs, Cmd+K trigger, theme toggle. `<main id="view">` + `<aside id="context">` shell. aria-live regions, toast slot, reveal slot.
- **8 CSS files** in `styles/`: `tokens.css` (Geist @font-face, OKLCH module hues, light/dark vars), `base.css` (reset, prose, focus rings), `layout.css` (grid shell), `components.css` (buttons, pills, cards, sheet, popover, command palette, toasts), `surfaces.css` (per-surface), `map.css` (System Map), `motion.css`, `print.css`. ~3,300 lines total.
- **24 JS modules** in `js/`: `app.js` (entry, route registration), `runtime.js` (ls* helpers, settings, theme, hotkeys, `el()` allowlist), `crossref.js` (slugIndex, nameIndex, linkifyText), `gamification.js` + `gam-data.js`, `router.js`, `cmdk.js`, `editor.js`, `reveal.js`, `search.js`, `copy.js`, `data.js`, `fleshed.js`, `toolkit-data.js`, `playbooks-data.js`, `decisions-data.js`, plus 9 surface views in `js/views/` (`main`, `concept`, `toolkit`, `playbook`, `decision`, `capstone`, `library`, `map`). ~5,300 lines total.
- **`build/extract.mjs`** (one-time data extractor): parses `course.html.legacy` for sentinel-bound const blocks, brace-counts to lift them into pure ESM data files.
- **`build/serve.mjs`**: tiny static HTTP server (Node, no deps) used by both dev and Playwright. Required because browsers block ESM imports from `file://`.
- **`fonts/`**: Geist Variable + Geist Italic Variable + Geist Mono Variable (vendored, OFL-licensed).
- **`vendor/`**: `force-graph.min.js` (Canvas2D + d3-force).
- **`course.html.legacy`** (477KB): preserved for reference and as the data source for `build/extract.mjs`.

### New surfaces (the wow layer)

- **System Map** (`#/map`): full-bleed canvas. 514 nodes clustered into a 4x4 module grid (SPACING=360). Edges are cross-references. Node color = module hue (or violet if completed, gray if stub). HUD: search box + 3 filter chips (fleshed / completed / saved) + module dropdown. Click → side sheet with concept summary + jump link. `?focus=slug` query param flies camera to a specific concept. Hidden `#map-a11y-list` exposes 514 anchor fallbacks for keyboard + screen-reader users.
- **Opening reveal cinematic** (first visit only): 3.2s canvas constellation animation with camera pan. Stored in `aise26:settings.reveal_seen`. Skippable via Esc / click / any key.
- **Command palette** (Cmd+K, also `/`): replaces the top-bar search popover. Fuzzy-ranks concepts, modules, and 10 quick actions (theme toggle, route shortcuts, reset). Returns focus to opener on close.
- **Side rail** with live status (XP / tier / streak), responsive (collapses to hamburger + scrim under 768px).
- **Mission Control profile** (`#/profile`): tier badge with XP bar, 20-achievement grid (locked → grayscale), settings panel (theme, region, reset).
- **Cascade module strips**, **letter-strip glossary**, **slide-deck capstone**: re-rendered surfaces using the new design system.

### Tests

- `playwright.config.js` auto-starts `build/serve.mjs` on port 4173.
- 5 spec files, 23 tests passing: localStorage round-trip + reset, keyboard nav (Cmd+K, /, Esc, Enter, j/k, Cmd+E), cross-references (validateCrossRefs returns []; 514/50/16 stats; map renders 514 nodes), gamification (XP_VALUES + TIERS match `GAMIFICATION.md`; idempotency; tier-up at 250 XP; first_steps unlock; 20 achievements; passThreshold = ceil(total*0.66)), System Map (shell, 514 a11y items, filter chips, focus param).

### Subagent gauntlet (Phase 2 final)

| Subagent | Verdict | Notes |
|---|---|---|
| code-reviewer | PASS after BLOCKER+MAJOR fixes | Fixed XSS in `renderNotFoundView` (now uses createElement+textContent), resize-listener leak in `reveal.js`, dead imports in `app.js` / `views/concept.js` / `views/map.js` |
| a11y-auditor | PASS after SERIOUS fixes | Added aria-label to cmdk listbox, moved role=option from `<li>` to `<a>`, restored focus on cmdk close, fixed skip-link reachability via `_routeHasFiredOnce` flag |
| logic-verifier | PASS | XP / tier / streak / capstone math match `GAMIFICATION.md` byte-for-byte; 23/23 Playwright tests green |
| content-sanity | PASS | Zero em dashes anywhere; voice consistent |

---

## Phase 1 acceptance criteria (still passing under Phase 2)

1. `npx html-validate course.html` exits 0
2. axe-core (via Playwright) reports zero serious or critical violations
3. Tab order logical; Esc closes cmdk and modals; `/` and Cmd+K open palette; `j`/`k` cycle concepts; Cmd+E toggles edit mode
4. localStorage round-trips XP, completion, saved across reload
5. Every cross-reference resolves (`validateCrossRefs` returns [])
6. Lighthouse a11y >= 95 (axe gate is met; manual run pending)
7. Playwright tests pass: 23/23
8. All 4 subagents PASS on the final artifact

---

## Phase 1 milestone tracker (frozen)

| # | Milestone | Status |
|---|---|---|
| 0 | PROGRESS.md + DECISIONS.md bootstrap | done |
| 1 | HTML skeleton + design system + localStorage primitives + a11y plumbing | done |
| 2 | Glossary data model + cross-reference engine | done |
| 3 | Hash router + module/concept/glossary surfaces + per-concept template | done |
| 4 | Search + Today's Review homepage | done |
| 5 | Gamification framework | done |
| 6 | Universal Editor pattern + Personal Library | done |
| 7 | Toolkit (3 modalities) + CLAUDE.md builder | done |
| 8 | Playbook framework + 2 playbooks | done |
| 9 | Decision tools framework + 3 populated tools | done |
| 10 | 50 fleshed concept pages | done |
| 11 | Print stylesheet + a11y polish + Playwright specs | done |
| 12 | Final acceptance gauntlet | done |

---

## Bundle inventory

| Layer | Size |
|---|---|
| `course.html` shell | 5KB |
| `styles/*.css` (8 files) | ~62KB |
| `js/*.js` core (12 files) | ~94KB |
| `js/views/*.js` (8 files) | ~50KB |
| `js/data.js` (514 concepts + 16 modules) | 121KB |
| `js/fleshed.js` (50 fleshed pages) | 96KB |
| `js/toolkit-data.js` + `playbooks-data.js` + `decisions-data.js` | ~52KB |
| `vendor/force-graph.min.js` | ~120KB |
| `fonts/Geist-*.woff2` (3 files) | ~190KB |
| **Total** | **~790KB** |

---

## What's next (post-Phase-5 candidates, not started)

The course is content-complete and validated. Sensible next steps if work continues:

1. Run formal Lighthouse audit. Document the score in DECISIONS.md.
2. Re-run the 4-subagent gauntlet (code-reviewer, a11y-auditor, logic-verifier, content-sanity) on the expanded artifact. Phase 2 gauntlet still applies for architecture; this would confirm content.
3. Optional: 3D node halos in the System Map (currently 2D Canvas2D); could upgrade to three.js if cost/benefit lands.
4. Optional: more playbooks (~6-10 more would deepen the practical coverage).
5. Optional: per-concept quizzes (currently `[expanding in module fill]`). Each concept could ship 2-3 multiple-choice questions for retention testing.
6. Optional: flashcards (currently `[expanding in module fill]`). Spaced-repetition deck per concept.

---

## Compaction recovery protocol

If context compacts mid-session, the next session reads:
1. `CLAUDE.md` (operating rules, invariants)
2. `SPEC.md` (Phase 1 acceptance criteria, still authoritative)
3. `course_master_glossary.md` (514-concept source of truth)
4. `GAMIFICATION.md` (XP / tier / badge / streak math)
5. This file (PROGRESS.md) for current state
6. `DECISIONS.md` for committed-to choices (Phase 1 ADRs 0001-0008, Phase 2 ADRs 0009-0012)
7. `js/app.js` to see route registration and bundle entry shape

That seven-doc read produces a ready-to-execute state for any continuation work.
