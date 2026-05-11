// Career hub: aggregator at #/career. Indexes career tools that live in
// their natural homes (toolkit, decisions, practice).

import { el, getSettings } from '../runtime.js';
import { CONCEPTS } from '../data.js';
import { conceptsForModule } from '../crossref.js';
import { getConceptState } from '../gamification.js';

export function renderCareer() {
  const wrap = el('article', { 'aria-labelledby': 'cr-h1', class: 'fade-up' });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'Career hub'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'cr-h1' }, 'Career'));

  const settings = getSettings();
  const profile = settings.profile || {};

  // ----- Trajectory -----
  wrap.appendChild(el('section', { class: 'practice-section' }, [
    el('h2', null, 'Your trajectory'),
    el('div', { class: 'continue-hero' }, [
      el('div', null, [
        el('div', { class: 'label' }, 'Goal'),
        el('div', { class: 'target' }, profile.goal || 'No goal set'),
        el('div', { style: 'font-size: var(--fs-100); color: var(--text-3); margin-top: 4px;' },
          (profile.role ? 'Role: ' + _humanize(profile.role) + ' · ' : '') +
          (profile.level ? 'Level: ' + profile.level : '')
        )
      ]),
      el('a', { class: 'btn btn-ghost', href: '#/settings?tab=profile' }, 'Edit')
    ])
  ]));

  // ----- Live tools -----
  const toolsSec = el('section', { class: 'practice-section' });
  toolsSec.appendChild(el('h2', null, 'Live tools'));
  const tools = el('div', { class: 'practice-cards' });
  tools.appendChild(_toolCard('📝', 'Resume bullets', 'Generate AI engineering bullets from your completed modules + saved concepts. Heuristic + AI modes.', '#/toolkit/utility/resume-bullets'));
  tools.appendChild(_toolCard('💰', 'Salary negotiator', 'Comp ranges by role × location × experience × company tier. Cites M12 data.', '#/decision/salary-negotiator'));
  tools.appendChild(_toolCard('🎤', 'Mock interview', 'Concept explanation + Systems design. Heuristic / AI grading.', '#/interview'));
  tools.appendChild(_toolCard('💡', 'Portfolio ideas', '5 buildable projects scoped to your completed modules.', '#/toolkit/utility/portfolio-ideas'));
  tools.appendChild(_toolCard('🎯', 'Systems-design interview', '12 prompts with rubric grading.', '#/interview'));
  toolsSec.appendChild(tools);
  wrap.appendChild(toolsSec);

  // ----- Module 12 stats -----
  const m12 = conceptsForModule(12);
  const m12Read = m12.filter(c => getConceptState(c.slug).complete).length;
  wrap.appendChild(el('section', { class: 'practice-section' }, [
    el('h2', null, 'Module 12: Career & The Job Market'),
    el('p', { style: 'color: var(--text-3);' }, 'The recruiter and hiring-manager conversation. ' + m12.length + ' concepts; ' + m12Read + ' read.'),
    el('a', { class: 'btn btn-primary', href: '#/module/12' }, 'Open M12 →')
  ]));

  // ----- External resources -----
  wrap.appendChild(el('section', { class: 'practice-section' }, [
    el('h2', null, 'External resources'),
    el('div', { style: 'display: grid; grid-template-columns: 1fr; gap: 8px;' }, [
      _link('Levels.fyi', 'Crowd-sourced compensation data; canonical reference for AI-lab medians.', 'https://www.levels.fyi'),
      _link('Built In', 'Dominant US AI-specific job board. Salary disclosures concentrated.', 'https://builtin.com'),
      _link('Hacker News Who\'s Hiring', 'Monthly thread; high-signal AI startup roles.', 'https://news.ycombinator.com/submitted?id=whoishiring'),
      _link('Y Combinator Work at a Startup', 'Startup-only job board; YC-curated.', 'https://www.workatastartup.com'),
      _link('AI Tinkerers', 'Global meetup network · 220 cities · live demos only.', 'https://aitinkerers.org')
    ])
  ]));

  return {
    node: wrap,
    title: 'Career',
    crumbs: [{ label: 'Career' }],
    mainClass: 'no-rail'
  };
}

function _toolCard(icon, title, desc, href) {
  return el('a', { class: 'practice-card', href, style: 'text-decoration: none; color: inherit;' }, [
    el('div', { class: 'practice-card-eyebrow' }, icon + ' · Tool'),
    el('div', { class: 'practice-card-headline' }, title),
    el('p', { class: 'practice-card-desc' }, desc),
    el('div', { style: 'font-size: var(--fs-100); color: var(--accent);' }, 'Open →')
  ]);
}
function _link(label, desc, href) {
  return el('a', {
    class: 'recommend-card',
    href,
    target: '_blank',
    rel: 'noopener'
  }, [
    el('div', { class: 'eyebrow' }, 'External'),
    el('div', { class: 'name' }, label + ' ↗'),
    el('div', { class: 'reason' }, desc)
  ]);
}
function _humanize(s) { return String(s || '').replace(/-/g, ' '); }
