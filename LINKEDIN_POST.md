# AISE 26 - LinkedIn launch post

## Post copy (paste this as-is)

Bonus drop between builds: AISE 26 just shipped. https://aise.psyrcuit.com

I started this as my own study notes during the 90-day sprint. Every time a concept came up that I'd half-remembered, I wrote it down properly. 514 concepts and 16 modules later, it had stopped being notes and started being its own thing.

This is the atlas I wish existed when I started. Every term that shows up in AI Solutions Engineer interviews, JD writeups, or production debugging sessions, with the why behind it and how the pieces connect.

A few decisions worth flagging:

There's a System Map. 514 concepts as colored dots in a force-directed pinwheel, 16 modules as the wedges of the wheel, cross-references rendered as edges through the middle. Drag to pan, click a dot for the concept page. Easier to see how RAG, evals, and context engineering touch each other when they share visual space.

Working tools live alongside the reading. Token counter, cost calculator, prompt linter, latency budget for voice agents, system-prompt analyzer, JSON-schema generator, resume-bullet generator, portfolio idea generator. The same surface you use to learn what hybrid search is, you also use to estimate your monthly model bill.

Spaced repetition is built in. Every concept has a flashcard. The Review tab schedules them with SM-2 so the stuff you struggle with comes back sooner. Quizzes shuffle their answer positions on every render so you actually have to read the question.

Local-first by design. No accounts, no analytics, no backend on my end. Your progress lives in your browser. The optional AI features (chat sidebar with Ask / Tutor / Rewrite tabs) only activate if you paste an Anthropic or OpenAI key. Keys are encrypted in-browser with AES-GCM + PBKDF2 (100k iterations) using a passphrase only you know. The encrypted blob lives in localStorage on your device; the passphrase stays in session memory and never leaves your machine. API calls go from your browser straight to the model vendor, so your key never touches a server I run.

Stack: vanilla HTML/CSS/JS, no build step, force-graph + d3-force on Canvas2D, Cloudflare Pages. AI features use Claude Haiku 4.5 by default (BYO key, your choice of model).

Code: https://github.com/Psyrcuit/AISE-Course
Full portfolio: https://psyrcuit.com/portfolio
Next scheduled build (Disagreement Lens) ships in 1-2 weeks.

Currently exploring AI Solutions Engineer / Forward Deployed Engineer / AI Solutions Architect roles. This one is half learning artifact, half proof I can both teach the work and ship the work.

Open to conversations: <<YOUR CALENDLY OR DM URL HERE>>

#BuildInPublic #AIEngineering #SolutionsEngineering #LLM #OpenToWork

---

## Two things to fill in before posting

1. **Calendly / DM URL** - replace `<<YOUR CALENDLY OR DM URL HERE>>` with your actual link.
2. **Verify `psyrcuit.com/portfolio` is live.** If not, drop the line or swap the URL.

---

## Images

- `og.jpg` auto-embeds when LinkedIn fetches the URL
- Attach `hero-map.png` manually as the first image slot

---

## Hashtags

`#BuildInPublic #AIEngineering #SolutionsEngineering #LLM #OpenToWork`

---

## Posting checklist

1. `git push` from `course/` to deploy.
2. Wait 60 seconds for Cloudflare Pages to build.
3. Open `https://aise.psyrcuit.com` in incognito; confirm reveal cinematic plays, logo renders, System Map shows the pinwheel.
4. Paste post copy into LinkedIn composer.
5. Wait for the URL preview (og.jpg) to populate.
6. Attach `course/hero-map.png` as the first image.
7. Verify hashtags on last line.
8. Schedule for 7-10am PT / 10am-1pm ET if possible.
9. Post.
10. Drop one extra detail in the first comment within 5 minutes to push it into "active discussion" feed ranking.
