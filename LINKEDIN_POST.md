# AISE 26 — LinkedIn launch post

## Post copy (paste this as-is)

Bonus drop between builds: AISE 26 just shipped. https://aise.psyrcuit.com

I started this as my own study notes during the 90-day sprint. Every time a concept came up that I'd half-remembered, I wrote it down properly. 514 concepts and 16 modules later, it had stopped being notes and started being its own thing.

This is the atlas I wish existed when I started. Every term that shows up in AI Solutions Engineer interviews, JD writeups, or production debugging sessions, with the why behind it and how the pieces connect.

A few decisions worth flagging:

Map first, table of contents second. The home page is a force-directed wheel where every concept is a dot and cross-references are visible edges. Drag to pan, click for the deep page. Easier to see how RAG, evals, and context engineering touch each other when they share visual space.

Working tools live alongside the reading. Token counter, cost calculator, prompt linter, latency budget for voice agents, system-prompt analyzer, JSON-schema generator, resume-bullet generator, portfolio idea generator. The same surface you use to learn what hybrid search is, you also use to estimate your monthly model bill.

Spaced repetition is built in. Every concept has a flashcard. The Review tab schedules them with SM-2 so the stuff you struggle with comes back sooner.

Local-first. No accounts, no analytics, no backend at all. Your progress lives in localStorage. The optional AI features (chat sidebar, tutor mode, harder-quiz generator) only fire if you paste an Anthropic or OpenAI key, which gets encrypted with WebCrypto before it touches disk.

Stack: vanilla HTML/CSS/JS, no build step, force-graph + d3-force, Cloudflare Pages, Claude Opus 4.7 for the AI mode. Repo is public.

Code: https://github.com/Psyrcuit/AISE-Course
Full portfolio: psyrcuit.com/portfolio
Next scheduled build (Disagreement Lens) ships in 1-2 weeks.

Currently exploring AI Solutions Engineer / Forward Deployed Engineer / AI Solutions Architect roles. This one is half learning artifact, half proof I can both teach the work and ship the work.

Open to conversations: https://lnkd.in/gh72JNcB

#BuildInPublic #AIEngineering #SolutionsEngineering #LLM #OpenToWork

---

## Images to attach

LinkedIn auto-embeds the og.png from the URL preview, so the first image is automatic.

Manually attach **hero-map.png** (or .jpg) as a second image for a stronger thumbnail when the post auto-embed unfurls slowly. Both files live in `course/`:

- `course/og.png` (1200×630 landscape, auto-embedded from the URL)
- `course/og-square.png` (1200×1200 square, for WhatsApp / iMessage / DM previews)
- `course/hero-map.png` (1200×1200 stylized pinwheel, recommended manual attachment)

If you'd prefer a live screenshot, take one of `aise.psyrcuit.com/#/map` in dark mode at desktop width. The settled mandala pattern is the strongest visual.

---

## Hashtag rationale

5 picks (LinkedIn dilutes when you stack 10+):

- **#BuildInPublic** — pulls in the indie-AI builder crowd that already engages with your demo cadence.
- **#AIEngineering** — broad enough to land in the right feeds, narrow enough to filter out marketing noise.
- **#SolutionsEngineering** — surfaces you to the exact role pool you're targeting. Forward Deployed and Solutions Architect recruiters search this tag.
- **#LLM** — the standard, high-volume tag that gets the post past the initial visibility threshold.
- **#OpenToWork** — explicit signal to recruiters running saved-search alerts. Worth swallowing the slightly-too-promotional vibe.

Alternates if you want to swap one out:
- `#RAG` (if Mirror's post is still trending, RAG keeps the demo thread continuous)
- `#AIAgents` (overlaps with #AIEngineering; pick if you want to lean into the agentic angle)
- `#ForwardDeployedEngineer` (specific; lower volume but pure recruiter discovery)
- `#OpenSource` (the repo is public; if engagement skews dev-tools)

---

## Posting checklist

1. Paste copy into LinkedIn composer.
2. Wait for the URL preview to populate (should show og.png with "514 concepts. 16 modules. One map." headline and concept chips).
3. If the preview doesn't load, click the X on the auto-preview, then manually attach `og.png` as the first image.
4. Attach `hero-map.png` as a second image.
5. Verify the conversation link at the bottom still points to your active Calendly / inbox.
6. Post early in the working day (your AI-builder audience is most active 7-10am PT / 10am-1pm ET).
7. After posting, comment with one extra detail (the SRS algorithm choice, why the pinwheel layout, or your favorite concept page) to push it into the "active discussion" bucket in feed ranking.

---

## Notes on voice (so we keep it consistent for future posts)

- Lead with what shipped + link, not the build context.
- Frame technical decisions as choices, not features ("Map first, table of contents second").
- Specific numbers in the body (514, SM-2, no backend).
- Stack line near the bottom, repo-link adjacent.
- "Currently exploring [roles]" near the bottom, never at the top.
- Avoid: em dashes, "delve", "dive into", "moreover", "tapestry", "in the ever-evolving landscape of".
- The voice is direct, technical, slightly understated. The thing should sell itself in the screenshot.
