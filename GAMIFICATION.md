# Gamification Formulas

This file is the **byte-for-byte source of truth** for all XP, tier, badge, and streak math in `course.html`. The `logic-verifier` subagent reads this file and confirms the implementation matches exactly.

---

## XP earning surface

```
CONCEPT_COMPLETE              = 5    XP
CONCEPT_QUIZ_PASS             = 10   XP
FLASHCARD_MASTERED            = 5    XP    (graduates to Leitner box 5)
MODULE_QUIZ_PASS              = 50   XP
MODULE_COMPLETE               = 200  XP
CAPSTONE_PASS                 = 100  XP
STREAK_7DAY_MILESTONE         = 50   XP
STREAK_30DAY_MILESTONE        = 200  XP
NOTE_WRITTEN_FIRST_TIME       = 5    XP   (one-time per concept)
CROSS_REF_CLICKED_X25         = 25   XP   (achievement bonus)
```

XP is awarded once per (action, target) tuple. Reawarding the same action on the same target is a no-op.

---

## Tier progression

Tiers are computed on-the-fly from total XP. Crossing a threshold triggers a 3-second toast notification (no modal, no flow break).

```
TIER 1: Curious Engineer            0      XP
TIER 2: Apprentice Builder          250    XP
TIER 3: Practicing Engineer         750    XP
TIER 4: AI Engineer                 1750   XP
TIER 5: Solutions Engineer          3500   XP
TIER 6: Solutions Architect         6000   XP
TIER 7: Forward Deployed Engineer   9000   XP
TIER 8: Principal Architect         13000  XP
```

Total XP available across the course at maturity: ~15,000-18,000.

Tier badge displays in the top-right corner at all times, plus on the Personal Library profile section.

---

## Streak system

```
STREAK_INCREMENT_TRIGGER  = ANY of:
                            - daily quest completed
                            - 5+ flashcards reviewed
                            - 1+ new concept read
STREAK_RESET_TIME         = midnight UTC
WEEKLY_SKIP_TOKEN         = 1, resets every Monday 00:00 UTC
STREAK_DISPLAY            = small flame icon + integer counter on homepage
```

Streak counter increments at most once per UTC day. If user has streak >= 1 and 1 full UTC day passes with no qualifying action AND weekly skip token is unused: skip token consumed silently, streak preserved. Otherwise: streak resets to 0.

No popups, no nagging, no "you broke your streak" messages. Display the new count, do not editorialize.

---

## Daily Quest selection algorithm

Pick today's quest by priority (first match wins):

1. Concept where `concept.complete === false AND concept.module === user.currentModule`
2. Concept tied to the user's weakest flashcard (lowest Leitner box, oldest review date)
3. Random concept where `concept.complete === false`

If all 390 concepts are complete: surface a "Course Complete" tile instead of a daily quest.

Quest selection happens at first page load each UTC day and persists in localStorage as `aise26:daily_quest:{YYYY-MM-DD}`.

---

## Capstone scoring

```
CAPSTONE_PASS_THRESHOLD = ceil(total_steps * 0.66)    # 4 of 6, 5 of 8, etc.
CAPSTONE_RETRY_ALLOWED  = true
CAPSTONE_REWARD         = CAPSTONE_PASS XP + boss-defeated badge
CAPSTONE_FAIL_FEEDBACK  = show which steps were wrong with brief explanation
```

Capstones are JSON-defined per module. Phase 1 ships the framework; capstone content populates during module fill.

---

## Achievement registry (20 at launch)

Each achievement is unlocked by hitting its specific condition. Display as small SVG icon on the Personal Library profile page with unlock date. Bonus XP awarded on unlock.

```
ID                    | CONDITION                                       | BONUS XP
----------------------|-------------------------------------------------|----------
first_steps           | First concept completed                         | 10
vocab_explorer        | 50 flashcards mastered                          | 50
builder               | Anthropic Stack module complete                 | 100
rag_whisperer         | All RAG concept quizzes passed                  | 75
architect             | First module complete                           | 50
polyglot              | International comp toggle used                  | 10
speedrunner           | Module complete in one session (no tab close)   | 75
persistent            | 7-day streak                                    | 50
iron_mind             | 30-day streak                                   | 200
stack_master          | All 16 modules complete                         | 500
cross_referencer      | 50 cross-reference links clicked                | 25
note_taker            | Notes written on 25 concepts                    | 50
saver                 | 20 concepts saved for later                     | 25
capstone_crusher      | 5 module capstones passed first try             | 150
boss_slayer           | All 16 module capstones passed                  | 500
local_hero            | Local-First module complete                     | 100
recruiter_ready       | Career module complete                          | 100
compliance_officer    | Enterprise Architecture module complete         | 100
encyclopedia          | Every concept in glossary read                  | 250
self_taught           | Self-Taught Builder Playbook section complete   | 50
```

Unlock detection runs on every state mutation (concept complete, quiz pass, flashcard mastery, module complete, etc.). Use a single `checkAchievements(state)` function called from a state-change observer.

---

## localStorage schema

All keys namespaced `aise26:`.

```
aise26:xp                       → integer (total XP)
aise26:tier                     → integer (1-8, computed from XP, cached for performance)
aise26:streak                   → { count: int, last_active_utc_date: 'YYYY-MM-DD', skip_used_week: 'YYYY-WW' }
aise26:concept:{slug}           → { complete: bool, completed_at: ISO string, quiz_score: int|null, notes: string }
aise26:flashcard:{slug}         → { box: 1-5, last_reviewed: ISO string, next_due: ISO string }
aise26:module:{n}               → { complete: bool, capstone_passed: bool, capstone_score: int|null }
aise26:saved                    → array of concept slugs
aise26:edit_{type}_{slug}       → string (user-edited content)
aise26:builder_draft_{type}     → object (partial builder state)
aise26:achievements             → object { achievement_id: { unlocked_at: ISO string } }
aise26:daily_quest:{YYYY-MM-DD} → { concept_slug: string, completed: bool }
aise26:settings                 → { dark_mode: bool, region: 'US'|'INTL', search_history: array }
```

Reset button (in settings) clears all `aise26:*` keys after confirmation.

---

## Validation rules (logic-verifier checks all of these)

1. Every XP-awarding action in `course.html` matches the table above exactly.
2. Tier thresholds are exact integers, not approximations.
3. Streak rollover at UTC midnight is timezone-correct (use `Date.UTC()`, never local time).
4. Daily quest selection follows the priority order above.
5. Capstone pass threshold uses `Math.ceil(total_steps * 0.66)`, not `Math.floor` or `Math.round`.
6. Every achievement in the registry has a corresponding unlock-detection branch in `checkAchievements()`.
7. localStorage key names match the schema exactly. No typos. No legacy keys.
8. Reset button confirms before clearing.
9. No XP, badge, or streak action occurs without a corresponding aria-live announcement.
