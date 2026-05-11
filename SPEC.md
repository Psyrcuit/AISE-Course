# Phase 1 Build Specification

**Deliverable:** `course.html` — a single self-contained HTML file that scaffolds the AI Solutions Engineer / Architect 2026 Course with all UX systems wired and ~50 of the 390 glossary stubs fully fleshed as quality references.

**Phase 1 is NOT a complete course.** It is the scaffolding plus seeded content that future module fill phases populate.

---

## 1. Functional scope (must ship in Phase 1)

### Navigation and content surface

- Top-level navigation across 16 modules
- Glossary surface listing all ~390 concepts alphabetically with click-through to home module
- Per-concept page template renders: name, aliases, stub, cross-references (clickable), placeholders for full explanation, examples, quiz, flashcard, copy-paste deep-dive prompt, notes textarea, save-for-later flag, completion checkbox
- Module page template: brief intro, concept list with stubs, completion progress bar, "next module" navigation
- Cross-reference engine: every concept name auto-hyperlinks to its home page wherever it appears in any module text
- Full-text search across all stubs with concept-level result highlighting
- Top-level "Today's Review" homepage widget
- Top-level "Personal Library" surface aggregating saved concepts, edited prompts, edited templates, notes, builder drafts
- Dark mode toggle (persists in localStorage)
- Keyboard navigation (j/k = next/prev concept, / = focus search, esc = close modals, cmd/ctrl+E = toggle edit mode on focused block)
- Copy-link-to-concept (deep links to specific anchors)
- Export-my-library button (markdown dump of all user content)

### Persistence layer

- Module-level completion state
- Concept-level completion state
- Quiz scores per concept (stub structure, no quizzes populated yet)
- Flashcard mastery state (Leitner 5-box system; stub structure, no cards populated yet)
- Notes per concept
- Save-for-later concept flags
- Edited prompts/templates (full editor pattern wired)
- Builder drafts
- Reset button clears all state

### Gamification framework

- XP counter (visible in top-corner badge)
- Tier progression (8 tiers: Curious Engineer to Principal Architect; thresholds per GAMIFICATION.md)
- Achievement registry (20 achievements defined, unlock logic wired, badges render on profile page)
- Streak system (last-active date, streak counter, weekly skip token, midnight UTC rollover)
- Daily Quest widget on homepage (selects concept algorithmically)
- Capstone framework (renders JSON-defined scenarios; populated capstones come during module fill)

### Toolkit (3 modalities)

- Toolkit framework with 3-modality structure
- ~5 static templates fully populated: CLAUDE.md (solo dev), SKILL.md (Generator pattern), SKILL.md (Inversion pattern), SKILL.md (Chained Inversion pattern), plugin.json
- ~4 generator prompts fully populated: CLAUDE.md generator, SKILL.md generators (Generator/Inversion/Chained Inversion patterns)
- 1 polished build-your-own widget: CLAUDE.md builder
  - User picks from option blocks per section: Voice/style, Tools available, Naming conventions, Test expectations, Architecture rules, Repo conventions, Security rules, Things future-you will forget
  - Each section has 3-5 default option blocks plus custom-edit field
  - Output renders below in real-time
  - localStorage saves drafts
  - Copy-to-clipboard outputs final markdown

### Editor pattern (universal)

- Every copy-paste artifact (deep-dive prompts, generator prompts, static templates, notes, builder drafts) is editable in place
- Plain textarea, no formatting features
- Auto-save to localStorage on blur with 500ms debounce
- Edit / Save / Cancel / Reset / Copy buttons on every editable block
- "Edited" indicator when localStorage has a custom version
- Storage key pattern: `aise26:edit_{type}_{slug}`

### Playbook framework

- Playbook framework with reusable template (outcome, prerequisites, time estimate, concepts touched, numbered steps with checkpoints, what-to-do-next, common failures)
- 1-2 sample playbooks fully written (start with "Set up your Claude Code environment from zero in 30 minutes")

### Decision tools

- Decision tools framework with interactive widget pattern
- 2-3 priority tools fully populated: RAG vs Fine-tuning vs Prompt Engineering, Agent framework selection, Vector database selection

### Glossary content

- All ~390 concept stubs from CONTENT.md rendered as one-liners with cross-references
- ~50 concepts fully fleshed as quality references (pick the most foundational across Modules 1, 3, 4, 5)
- Remaining 340 marked with `[expanding in module fill]` indicator

---

## 2. Non-functional requirements

- Mobile responsive (single-column on narrow viewports)
- Lighthouse a11y >= 95
- Zero serious or critical axe-core violations on WCAG 2.2 AA
- Page weight under 800KB initial load (sans fonts)
- First contentful paint < 1.5s on 3G simulation
- All interactive elements have visible focus states
- All modals trap focus and return focus on close
- Color contrast >= 4.5:1 in both light and dark mode
- aria-live regions announce XP changes, badge unlocks, streak updates
- Heading hierarchy is monotonic (no skipped levels)
- Every form input has an associated label
- Print stylesheet exists (course should be readable when printed)

---

## 3. Acceptance criteria (the build is NOT done until ALL pass)

1. `course.html` validates: `npx html-validate course.html` exits 0
2. axe-core: `npx @axe-core/cli course.html --tags wcag2aa` reports zero serious or critical violations
3. Tab order is logical; ESC closes every modal; `/` focuses search; `j`/`k` cycle concepts
4. localStorage round-trips XP, badges, streaks across page reload
5. Every cross-reference link resolves to an existing anchor (no dangling refs)
6. Lighthouse a11y >= 95
7. Playwright tests pass: `npx playwright test --reporter=line`
8. All 4 subagents return PASS on the final artifact (run in parallel via Agent tool at session end)

---

## 4. Explicitly OUT of Phase 1 scope

- Full module content (the 340 unflashed concept pages — Phase 2)
- Full quiz content (Phase 2)
- Full flashcard content (Phase 2)
- World map gamification view (Phase 1B)
- LinkedIn-jargon translator surface (Phase 1B)
- Diagram library (Phase 1B)
- Mock interview transcripts (Phase 2)
- More than 1 polished builder (SKILL.md builder, eval set builder come Phase 2)
- More than 2 sample playbooks (rest come during module fill)
- More than 3 decision tools (rest come during module fill)

If you find yourself reaching for any of these during Phase 1, STOP. Mark a `// PHASE 2:` comment and move on.

---

## 5. File output layout at end of Phase 1

```
project-root/
├── course.html              ← the deliverable
├── CLAUDE.md                ← operating rules (already present)
├── SPEC.md                  ← this file
├── CONTENT.md               ← glossary source
├── GAMIFICATION.md          ← formulas
├── PROGRESS.md              ← milestone log (you write this)
├── DECISIONS.md             ← ADR log (you write this)
├── README.md                ← shipping README (you write this at end)
├── .claude/
│   ├── settings.json
│   ├── agents/
│   │   ├── code-reviewer.md
│   │   ├── a11y-auditor.md
│   │   ├── logic-verifier.md
│   │   └── content-sanity.md
│   └── hooks/
│       ├── block-destructive.sh
│       ├── lint-on-write.sh
│       ├── log-tokens.sh
│       ├── stop-gate.py
│       └── subagent-pass-required.sh
└── tests/
    ├── localStorage.spec.js
    ├── keyboard-nav.spec.js
    ├── cross-references.spec.js
    └── gamification.spec.js
```
