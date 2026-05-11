# Course v3 — Design Spec (M-0)

This document locks the IA, layout patterns, and visual language for v3 before any implementation begins. All milestones M-A through M-H reference back to this spec. Decisions here override anything inferred elsewhere.

Companion to `PROGRESS.md` (state) and `DECISIONS.md` (ADRs). Not user-facing.

---

## 1. Locked decisions (from M-0 questionnaire)

| Axis | Decision |
|---|---|
| Primary user | Mixed / broad audience. Tone neutral; toolkit, career, decisions weight equally. Voice stays Stripe-Press-meets-textbook. |
| Session shape | Mixed: daily habit + weekend deep dives. Home shows "Today" (habit) AND "Continue + Discover" (deep dive) in editorial hierarchy. |
| Mobile | First-class. Bottom-tab nav <768px. Touch targets ≥44×44px. All new surfaces designed mobile-first. |
| AI prominence | Heuristics first; AI is a quiet upgrade. Small "AI" pill on features only when key is connected. No connect-key nag. |
| Practice hub | Unified `#/practice`. Top: Due today. Middle: Per-module. Bottom: Career prep. |
| Career placement | Distributed AND aggregated. Tools live in their natural homes; `#/career` aggregates them. |
| Onboarding | Medium (~2 min). Cinematic → 4-step wizard → optional placement. Skippable per step. |
| Personality volume | Balanced. Combos + sub-categories + streak insurance. 8 sound cues off-by-default. 3-5 easter eggs. Boss-battle capstone reskin optional. 5 themes. |

---

## 2. Information architecture

### Sitemap (final route list)

```
#/                              Home (Today / Continue / Discover)
#/onboarding                    First-launch wizard
#/path                          Skill tree (your-progression-aware)
#/map                           System Map (exploratory; 2D default)
#/map?3d=1                      System Map (3D, lazy-loaded)
#/modules                       Modules index
#/module/{n}                    Module page
#/glossary                      Alphabetical glossary
#/concept/{slug}                Concept page (workhorse)

#/practice                      Practice hub (unified)
#/review                        SRS flashcard review
#/interview                     Mock interview (Concept / Systems-design tabs)
#/capstone/{n}                  Capstone (existing)

#/toolkit                       Toolkit landing (5 modalities)
#/toolkit/{type}/{slug}         Existing template / generator / builder routes
#/toolkit/utility/{slug}        Utilities
  /token-counter                Counter + Visualizer (merged)
  /cost-calculator
  /prompt-linter
  /latency-budget
  /json-schema
  /system-prompt-analyzer
  /resume-bullets
  /systems-design
  /portfolio-ideas

#/career                        Career hub (aggregator)
#/playbooks                     Playbooks list (existing)
#/playbook/{slug}
#/decisions                     Decision tools list (existing)
#/decision/{slug}

#/library                       Personal Library (existing)
#/profile                       Tier badge, achievements, stats
#/stats                         Personal stats dashboard (heatmap, charts)
#/settings                      Tabbed: Profile / Appearance / API key / Data / About
```

### Side rail (desktop ≥768px)

Grouped into 4 buckets with collapsible group headers. Each group expands by default; user state persists per group.

```
─────────── Cartograph ───────────
[brand mark]

LEARN
  Home              #/
  Modules           #/modules
  Glossary          #/glossary
  Path              #/path
  System Map        #/map

PRACTICE
  Practice          #/practice
  Review (SRS)      #/review
  Interview         #/interview

BUILD
  Toolkit           #/toolkit
  Library           #/library
  Playbooks         #/playbooks
  Decisions         #/decisions

YOU
  Career            #/career
  Profile           #/profile
  Stats             #/stats
  Settings          #/settings

[XP bar / tier / streak]
```

15 visible items in 4 groups. Groups labeled with small uppercase headers (`var(--text-3)`, 11px, letter-spacing 0.06em). Group headers are clickable to collapse / expand the group; state persists at `aise26:settings.rail_groups`.

### Cmd+K only (no rail link)

- `#/onboarding` (replays from settings)
- Tutorial tour (replays from settings)
- Reset progress
- Toggle theme variant
- Toggle sound design
- 3D map shortcut
- Easter eggs

### Mobile (<768px) — bottom-tab navigation

Five tabs, fixed at bottom. Rest of rail collapses behind a "More" tab → drawer.

```
┌─────────────────────────────────┐
│                                 │
│         [main view]             │
│                                 │
├─────────────────────────────────┤
│  Home  Path  Practice  Build  ⋯ │
└─────────────────────────────────┘
```

Tab icons + labels. "⋯" opens a sheet with the full rail content. The current side-rail toggle becomes the "More" sheet on mobile.

---

## 3. Home page editorial hierarchy

`#/` has 4 sections in fixed order. Mobile and desktop share the same vertical stack; desktop allows the "Discover" section to use a 2-column grid.

```
─ Hero -------------------------------
  [Today]
   Daily Quest card (large, primary CTA)
   Streak flame · count · skip-token
   XP bar · Tier badge

─ Continue ---------------------------
   "Continue: <last concept name>"  → button
   Last opened: <date>

─ Practice ---------------------------
   "Due today"
   <N> flashcards · <N> quiz retakes · <N> capstones
   [Start review]                    → #/review

─ Discover ---------------------------
   Recommended next (3 cards)
   Recently fleshed (3 cards)
   [Browse all]                      → #/modules
─────────────────────────────────────
```

**Visual weight**

- Today: largest section. Daily Quest card is the primary CTA on the entire page.
- Continue: medium. Single line plus button.
- Practice: medium. Counts + single CTA.
- Discover: smallest. Cards 70% of Today's height.

If a section has no content (no SRS due, no last concept, no recommendations), it collapses to a one-line "No <thing> yet" placeholder. Sections never disappear; they shrink.

---

## 4. Concept page (consolidated layout)

The single most-visited surface. Order locked:

```
[Module eyebrow]
[Concept title]
[Aliases line]
[Module pill] [Subsection pill] [Fleshed/Stub pill]

[Definition]                  ← single paragraph
[What it actually is]         ← fleshed
[Architectural breakdown]     ← fleshed
[Worked example]              ← fleshed
[Common failures]             ← fleshed
[See also]                    ← cross-refs
[Deep-dive prompt]            ← Editor pattern
[Toolbar]                     ← see below
[Notes]                       ← textarea
[Flashcard]                   ← reveal-to-master
[Quiz]                        ← MCQ with feedback
[Prev / Next nav]
```

### Toolbar (refined for v3)

Single horizontal strip, sticky on scroll past 60% of the page.

```
[✓ Mark complete]  [♡ Save]  [🤖 Ask AI]  [🌐 View on map]  [⚙ Rewrite for...]
```

- **Ask AI**: opens `chat-sidebar` slide-in component. Three tabs inside: Ask / Tutor / Rewrite.
- **Rewrite for...**: dropdown "Engineer / PM / Leader / Custom" → calls personalized example rewriter (heuristic mode for the 3 canned personas, AI mode for Custom).
- AI buttons show a small "AI" pill when a key is connected; without a key, button still works in heuristic mode.

### Right rail context (desktop only)

```
[On this page]              ← TOC (existing)
[Module]                    ← module quick-link (existing)
[Cross-refs]                ← top 5 strongest cross-refs (NEW)
[Stats]                     ← times opened, last opened, mastery (NEW)
```

Mobile: right rail collapses into a sheet button at top-right of the article.

### Chat sidebar (NEW)

Slide-in from right; reuses existing `.sheet` styling.

```
┌────────────────────────────────┐
│  Concept: Retrieval-Augmented  │
│  Generation (RAG)        [×]   │
│  ──────────────────────────    │
│  [Ask] [Tutor] [Rewrite]       │
│  ──────────────────────────    │
│                                │
│   <conversation thread>        │
│                                │
│                                │
│  ──────────────────────────    │
│  > [type a question...]        │
│        [Heuristic]   [Send]    │
└────────────────────────────────┘
```

Width: 420px desktop. Full-screen sheet on mobile. Persists conversation per concept at `aise26:chat:{slug}`.

---

## 5. Practice hub (unified)

`#/practice` is the second-most-important surface after home. Designed as a "today / per-module / career" stack.

```
─ DUE TODAY -------------------------------------------
   [SRS deck]            12 cards   [Start review]
   [Quiz retakes]         3 quizzes [See list]
   [Daily quest]          1 card    [Start]

─ MODULES (per-module practice) -----------------------
   M1 Foundations
     [█████░░░░░] 14/41 fleshed read
     [Cumulative quiz]   [Capstone (passed ✓)]

   M2 Prompting Patterns
     [██░░░░░░░░] 5/21 fleshed read
     [Cumulative quiz]   [Capstone]

   ... (16 modules)

─ CAREER PREP -----------------------------------------
   [Mock interview · Concept]
   [Mock interview · Systems design]
   [Resume bullet draft]                  → #/career
─────────────────────────────────────────────────────
```

Design notes:

- "Due today" never shows zero — if nothing is due, show "All caught up — explore practice" with a CTA to start a cumulative quiz.
- Per-module rows are collapsible. Default state: current module expanded, others collapsed.
- "Start review" button cannot be missed (primary color, large) — drives the daily-habit loop.

---

## 6. Career hub

`#/career` aggregates career tools without duplicating them. Tools still live at their canonical routes; this surface is an index plus an outcome-focused dashboard.

```
─ Your trajectory -------------------------------------
   Goal (from onboarding):  "AI Solutions Engineer at $250K+"
   Profile:                 Mid-level engineer · 6 years
   [Edit goal]              → #/settings

─ Live tools -----------------------------------------
   [📝 Resume bullets]      Generate from completed modules
                           → #/toolkit/utility/resume-bullets
   [💰 Salary negotiator]   Comp ranges + rationale
                           → #/decision/salary-negotiator
   [🎤 Mock interview]      Concept + Systems design
                           → #/interview
   [💡 Portfolio ideas]     5 buildable projects
                           → #/toolkit/utility/portfolio-ideas

─ Module 12 deep dive ---------------------------------
   30 career concepts (roles, comp data, interview patterns)
   [Browse]                → #/module/12

─ External resources ----------------------------------
   AI Tinkerers · Built In · Levels.fyi · HN Who's Hiring
─────────────────────────────────────────────────────
```

---

## 7. Toolkit landing (5 modalities)

Replace equal-weight 3-card grid with horizontal tab navigation. Each tab has its own subpage state.

```
[ Templates ]  [ Generators ]  [ Builders ]  [ Utilities ]  [ Career ]
─────────────────────────────────────────────────────────────────────
                    [tab-specific content]
```

**Tabs and contents**

- **Templates** (5 existing): CLAUDE.md, SKILL.md (Generator / Inversion / Chained Inversion), plugin.json
- **Generators** (4 existing): CLAUDE.md generator + 3 SKILL.md generators
- **Builders** (existing 1, scaffolded for more): CLAUDE.md builder
- **Utilities** (NEW, 8 entries):
  - Token counter + visualizer (merged tool, two modes)
  - Cost calculator
  - Prompt linter
  - Latency budget
  - JSON Schema generator
  - System Prompt analyzer
  - Resume bullets
  - Systems-design interview
  - Portfolio ideas
- **Career** (NEW, indexed view): same items as `#/career` but contextualized within toolkit

Tab state persists at `aise26:settings.toolkit_tab`. Direct routes (`#/toolkit/utility/{slug}`) jump to the right tab.

---

## 8. Settings (tabbed)

`#/settings` replaces the inline settings block in profile.

```
[ Profile ]  [ Appearance ]  [ API key ]  [ Data ]  [ About ]
──────────────────────────────────────────────────────────────

PROFILE
  Role             [▼ select]   — engineer / PM / leader / curious
  Goal             [text]
  Level            [▼ select]   — beginner / intermediate / advanced
  Daily target     [▼ minutes]  — 5 / 10 / 20 / 30 / 60
  [Replay onboarding]
  [Replay tour]

APPEARANCE
  Theme            [▼] dark / light / cyberpunk / sepia / high-contrast
  Reduce motion    [☐] (auto-detects prefers-reduced-motion by default)
  Compact layout   [☐]
  Sound design     [☐] off / quiet / full
  [Listen to cues] (button) — preview sound set

API KEY
  Anthropic key    [•••••••••••] [Set] [Clear] [Test]
  OpenAI key       [•••••••••••] [Set] [Clear] [Test]
  Encryption       Local-only via WebCrypto (passphrase-derived AES-GCM)
  ⚠ Keys never leave your browser. See About for security details.

DATA
  Export library   → markdown (.md)
  Export settings  → JSON
  Import settings  ← JSON
  Reset progress   ⚠ destructive (with confirm dialog)

ABOUT
  Version          v3.0.0
  Concepts         514 fleshed
  Bundle           current size
  License          MIT (course content), see vendor/ for library licenses
  Source           [GitHub link]
```

Tabs persist; deep-linkable via `?tab=appearance`.

---

## 9. Visual language additions

### SRS card states

Four review-quality buttons. Each maps to an SM-2 quality value.

| Label | SM-2 q | Color token | Usage |
|---|---|---|---|
| Again | 0 | `--danger` (#EF4444 / oklch(0.66 0.22 26)) | "I forgot" — reset interval to 0 |
| Hard | 3 | `--warn` (#F59E0B / oklch(0.78 0.16 70)) | "Got it but barely" — small interval gain |
| Good | 4 | `--accent` (#B4A0FF dark / #6D28D9 light) | "Got it" — normal interval gain |
| Easy | 5 | `--success` (#10B981 / oklch(0.74 0.16 165)) | "Trivial" — extra interval gain |

Buttons appear in this left-to-right order: Again (red, leftmost) → Easy (green, rightmost).

### Skill tree node states

| State | Visual |
|---|---|
| Locked (prerequisite incomplete) | Muted gray, padlock icon, no hover effect |
| Available (unlocked, not started) | Module hue ring, white center |
| In progress (partially read) | Module hue with partial fill ring |
| Completed (read all sections) | Module hue full fill, ✓ icon |
| Mastered (quiz passed + flashcard mastered) | Module hue with sparkle outline + small star |

### AI badge

Small pill, 14×20px, appears next to feature labels when an API key is connected.

```
[Ask AI 🤖]      ← without key (heuristic only, no badge)
[Ask AI 🤖] AI   ← with key (badge visible, accent-colored)
```

Badge spec: `background: var(--accent)`, `color: var(--surface-0)`, font-size 9px, padding 2px 5px, border-radius 999px.

### Theme variants

5 themes, all sharing the same structural CSS. Variants swap CSS custom properties only.

| Theme | Background tone | Accent | Notes |
|---|---|---|---|
| Dark (default) | Warm neutral grays | Violet (#B4A0FF) | Cartograph baseline |
| Light | Cool warm whites | Violet (#6D28D9) | Cartograph baseline |
| Cyberpunk | Deep blue-black | Cyan + Magenta | High-contrast neon; for night sessions |
| Sepia | Warm cream | Brown-violet | Reading-focused; lower screen fatigue |
| High-contrast | Pure black/white | Pure violet | Accessibility-first; AAA contrast |

Each variant defines `--surface-0` through `--surface-5`, `--text-1` through `--text-5`, `--accent`, `--success`, `--warn`, `--danger`. All 16 module hues stay identical (perceptually-uniform OKLCH ramp).

### Sound cues (8 total, off by default)

| Cue | Use | Sound character |
|---|---|---|
| `xp` | XP awarded | Soft chime, ~80ms |
| `level-up` | Tier up | Ascending arpeggio, ~400ms |
| `achievement` | Achievement unlocked | Bell + sparkle, ~300ms |
| `streak` | Streak day milestone | Drum hit, ~120ms |
| `complete` | Concept completed | Soft chord, ~150ms |
| `quiz-correct` | Quiz answer correct | Light pluck, ~80ms |
| `quiz-wrong` | Quiz answer wrong | Soft thud, ~80ms |
| `nav` | Cmd+K open / route change | Subtle click, ~30ms |

User can preview all 8 from `#/settings → Appearance`. All sounds normalized to -18 LUFS to avoid jolts. Stored as base64 in `js/audio.js` (~50KB total).

---

## 10. Mobile-first pass

### Breakpoints

```
xs  : <480px      Single-column everything; bottom-tabs; fullscreen sheets
sm  : 480-767px   Single-column; bottom-tabs; sheets fill 90% viewport
md  : 768-1023px  Two-column home/practice; side rail (collapsible)
lg  : 1024-1399px Three-column on home; rail + main + right rail
xl  : ≥1400px     Wider main column max-width 880px; ample whitespace
```

### Bottom-tab navigation (<768px)

5 tabs visible:
- Home (`#/`)
- Path (`#/path`)
- Practice (`#/practice`)
- Build (`#/toolkit`)
- More (`⋯` → opens sheet with full rail)

Bottom-tab bar height: 64px (safe-area-inset-aware). Active tab indicator: top-edge bar in `--accent`.

### Touch target audit

All interactive elements ≥ 44×44px on mobile. Specifically:
- Concept page toolbar buttons: 44px height (currently smaller)
- Quiz option buttons: full-width, 56px height
- SRS quality buttons: 4-button row, equal width, 64px height
- Cmd+K result rows: 56px height
- Skill tree nodes: 48px diameter on mobile (32px on desktop)

### Reading mode

Full-screen distraction-free per concept. Toggle via toolbar icon. Hides rail, topstrip, right rail; widens prose; increases base font-size to 18px (mobile) / 20px (desktop).

### System Map on mobile

Force-graph still renders but defaults to module-cluster zoom (not full graph). Tap a cluster to drill in. Filter chips become a horizontal-scroll strip.

### Skill tree on mobile

Vertical orientation (modules stacked), horizontal scroll within each module's branch. Each node 48px diameter; tap to open concept.

---

## 11. Onboarding flow

4-step wizard, ~2 min total. Each step is skippable; "Skip onboarding" link in top-right of every step.

### Step 1 — Welcome

```
─────────────────────────────────
       Cartograph

    The 2026 AI Solutions
    Engineer's atlas.

    514 concepts · 16 modules
    Built for daily practice.

    [Get started]   [Skip]
─────────────────────────────────
```

Plays the existing reveal cinematic in the background; wizard text overlays.

### Step 2 — Role

```
What's your role?

[ Engineer leveling up        ]
[ Career-changer to AI roles  ]
[ Engineering leader/architect]
[ Just exploring              ]

← Back            Skip / Next →
```

### Step 3 — Goal

```
What's your goal?

  [text input · 80 char max]

Suggestions:
  · Ship a RAG system in 30 days
  · Land an AI Engineer role
  · Get fluent in agentic systems
  · Build a personal AI stack

← Back            Skip / Next →
```

### Step 4 — Level + path

```
Where are you starting?

[ Beginner: new to LLMs            ]
[ Intermediate: comfortable basics ]
[ Advanced: production experience  ]

──────────────────────────────────
Recommended path:
  Module 1 → Module 3 → Module 4
  (~3-5 hrs first week)

[Take placement quiz instead?]
[Take me to the recommended path →]
─────────────────────────────────
```

### Optional: Placement quiz

If user clicks "Take placement quiz", show 12 multiple-choice questions drawn from M1, M3, M4 with one M5 question. Scored on a 4-band scale; output adjusts the recommended path.

After completion, `aise26:settings.profile` is populated:
```js
{
  role: 'engineer-leveling-up',
  goal: 'Ship a RAG in 30 days',
  level: 'intermediate',
  placement_score: 9,  // optional
  recommended_path: ['module/3', 'module/4', 'module/8'],
  created_at: '2026-05-07T...'
}
```

After wizard: drop into `#/` with the new "Today" section populated by the recommended path.

---

## 12. Easter eggs

Restrained set; balanced with the overall personality volume.

| Trigger | Effect |
|---|---|
| Konami code (↑↑↓↓←→←→BA) anywhere | Unlocks "Konami master" achievement; toggles synthwave gradient on the home hero for 30s |
| Cmd+K typing `42` | Shows a tiny floating message: "the answer is hidden in Module 13" |
| Cmd+K typing `make me a sandwich` | Shows: "Use the deep-dive prompt to ask Claude. I'm a course." |
| First reaching tier 8 | Confetti + sound; unlocks "Engineer's Atlas" title |
| Reading after midnight UTC | Subtle "night mode" tint (-2% saturation, +1% warmth) for that session |

All easter eggs respect `prefers-reduced-motion`.

---

## 13. Accessibility

Targets WCAG 2.2 AA across all new surfaces. Specifics:

- All new interactive elements have visible focus rings (`box-shadow: 0 0 0 3px color-mix(in oklch, var(--accent) 28%, transparent)`).
- Skill tree nodes have aria-labels with state ("Available: RAG; Module 3").
- SRS card buttons have aria-keyshortcuts (`1` Again, `2` Hard, `3` Good, `4` Easy).
- Bottom-tab nav uses `<nav role="navigation" aria-label="Mobile primary">` with `aria-current="page"`.
- Settings tabs use the WAI-ARIA tabs pattern.
- Sound cues never replace visual feedback; visual is primary.
- Theme variants all clear AA contrast on body text and buttons.
- Audio mode has visible playback controls; keyboard-controllable.

---

## 14. State schema additions

New localStorage keys (all `aise26:` namespaced):

```
aise26:settings.profile               # { role, goal, level, placement_score?, recommended_path[], created_at }
aise26:settings.tour_seen             # boolean
aise26:settings.onboarding_seen       # boolean
aise26:settings.theme                 # 'dark'|'light'|'cyberpunk'|'sepia'|'high-contrast'
aise26:settings.sound                 # 'off'|'quiet'|'full'
aise26:settings.toolkit_tab           # last-active toolkit tab
aise26:settings.rail_groups           # { learn: open, practice: open, build: open, you: open }
aise26:settings.daily_target          # minutes/day target

aise26:api_key.anthropic              # encrypted ciphertext (never plain)
aise26:api_key.openai                 # encrypted ciphertext (never plain)
aise26:api_key.passphrase_hint        # optional plain-text hint

aise26:srs:{slug}                     # { interval, ease, lastReviewedAt, nextReviewAt, mastered }
aise26:concept_state.{slug}.quiz_attempts  # [{ at, score, total }]
aise26:activity.{YYYY-MM-DD}          # count of XP-awarding actions on that day (heatmap source)

aise26:chat.{slug}                    # ephemeral conversation thread for AI sidebar

aise26:easter_eggs.unlocked           # array of unlocked egg ids
```

---

## 15. Implementation order summary

M-A: Foundation (settings + profile split + WebCrypto for keys)
M-B: Onboarding + Path + Heatmap
M-C: Practice hub + SRS + Quiz history + Mock interview
M-D: Toolkit utilities (Counter merged, Cost, Prompt linter, Latency, JSON, System prompt)
M-E: AI-native (Chat sidebar with Ask/Tutor/Rewrite tabs)
M-F: Career hub + Career tools
M-G: Wild swings (PWA, audio, 3D, Pyodide, ePub, themes, sound, easter eggs)
M-H: Polish + tests + gauntlet

Each milestone references the appropriate sections above for spec.

---

*End of DESIGN.md. Reference this file from every milestone PR description.*
