# AISE 26 - LinkedIn launch post (final)

## Post copy (paste this as-is)

Two Claude Code sessions to ship a 514-concept atlas of 2026 AI engineering. The four-agent review gauntlet caught most of the bugs. I had to catch the rest myself.

AISE 26 just shipped. https://aise.psyrcuit.com

I started this as my own study notes during the 90-day sprint. Every time a concept came up that I'd half-remembered, I wrote it down properly. 514 concepts and 16 modules later, it had stopped being notes and started being its own thing. The atlas I wish existed when I started.

Three decisions worth flagging:

There's a System Map. 514 concepts as colored dots in a force-directed pinwheel, 16 modules as the wedges, cross-references rendered as edges through the middle. Drag, click a dot for the concept page. Easier to see how RAG, evals, and context engineering touch each other when they share visual space.

Working tools live alongside the reading. Token counter, cost calculator, prompt linter, voice-agent latency budget, system-prompt analyzer, JSON-schema generator, resume-bullet generator, portfolio-idea generator. Same surface for "what is hybrid search" and "what's my monthly model bill."

Local-first. No accounts, no analytics, no backend. Optional AI features (Ask / Tutor / Rewrite) only activate if you paste an Anthropic or OpenAI key, which gets encrypted in-browser with AES-GCM + PBKDF2 (100k iterations) using a passphrase only you know. Your key never touches a server I run.

About the build. The whole atlas (content, gamification math, force-directed map, 8 utilities, SRS, capstones, PWA) was built with Claude Code orchestrating a four-agent review gauntlet: code-reviewer, a11y-auditor, logic-verifier, content-sanity. They run in parallel after every milestone. Spec docs gate them so drift gets caught. Hooks block destructive commands and run html-validate, axe-core, and Playwright before any "done." Most milestones shipped on a single seed prompt.

The thing the gauntlet missed: 95% of correct quiz answers were authored at position 1. Agents pass structural checks; you still have to look for shape problems. Caught it on final manual audit, fixed with a per-render shuffle.

Stack: vanilla HTML/CSS/JS, no build step, force-graph + d3-force on Canvas2D, Cloudflare Pages. AI features use Claude Haiku 4.5 by default (BYO key).

Code: https://github.com/Psyrcuit/AISE-Course
Portfolio: https://psyrcuit.com/portfolio
Next build (Disagreement Lens) ships in 1-2 weeks.

Currently exploring AI Solutions Engineer / Forward Deployed Engineer / AI Solutions Architect roles. Half learning artifact, half proof I can both teach the work and ship the work, including the meta-skill of orchestrating agents.

Open to conversations: <<YOUR CALENDLY OR DM URL HERE>>

---

## Hashtags

`#BuildInPublic #AIEngineering #SolutionsEngineering #LLM #OpenToWork`

---

## Two fill-ins before posting

1. Replace `<<YOUR CALENDLY OR DM URL HERE>>` with your actual link.
2. Verify `https://psyrcuit.com/portfolio` resolves cleanly.

---

## Images

- `og.jpg` auto-embeds when LinkedIn fetches the URL.
- Attach `hero-map.png` manually as the first image.

---

## Posting checklist

1. Wait 60 seconds after `git push` for Cloudflare Pages to build.
2. Open `https://aise.psyrcuit.com` in incognito. Confirm reveal cinematic plays, logo renders top of rail, System Map shows the pinwheel.
3. Paste post copy into LinkedIn composer.
4. Wait for the URL preview (og.jpg) to populate.
5. Attach `course/hero-map.png` as the first image.
6. Verify hashtags on the last line.
7. Schedule for 7-10am PT / 10am-1pm ET if possible.
8. Post.
9. Drop one extra detail in the first comment within 5 minutes to push the post into "active discussion" feed ranking. Suggested first comment: the exact prompt template you used to kick off each milestone, or the cost ceiling math from CLAUDE.md.
