// Entry point. Imports everything, registers routes, mounts the app.

import './runtime.js';
import './crossref.js';
import './search.js';
import './gamification.js';
import './editor.js';
import './copy.js';
import './cmdk.js';
import './ai.js';
import './audio.js';
import './easter-eggs.js';
import './voice.js';
import { highlightAll } from './highlight.js';
import './components/pyodide-playground.js';

// Run highlighter after every route change.
document.addEventListener('aise26:after-route', () => {
  // Defer until DOM commits then traverse the rendered article.
  requestAnimationFrame(() => highlightAll(document.getElementById('main-region') || document));
});

import { registerRoute, route, setCycleList, _alphaSlugs } from './router.js';
import { hydrateTopBar } from './gamification.js';
import { maybeShowReveal } from './reveal.js';
import { conceptsForModule } from './crossref.js';

import { renderHome, renderModulesIndex, renderModulePage, renderGlossary, renderProfile } from './views/main.js';
import { renderConceptPage, setConceptCycleList } from './views/concept.js';
import { renderToolkit, renderToolkitArtifact } from './views/toolkit.js';
import { renderPlaybooks, renderPlaybookDetail } from './views/playbook.js';
import { renderDecisions, renderDecisionDetail } from './views/decision.js';
import { renderCapstone } from './views/capstone.js';
import { renderLibrary } from './views/library.js';
import { renderSystemMap } from './views/map.js';
import { renderMap3D } from './views/map3d.js';
import { renderSettings } from './views/settings.js';
import { renderOnboarding } from './views/onboarding.js';
import { renderPath } from './views/path.js';
import { renderPractice } from './views/practice.js';
import { renderReview } from './views/review.js';
import { renderInterview } from './views/interview.js';
import { renderModuleQuiz } from './views/module-quiz.js';
import { renderModuleStats } from './views/module-stats.js';
import { renderTopics, renderTopic } from './views/topics.js';
import { renderHistory } from './views/history.js';
import { renderShare } from './views/profile-share.js';
import { renderTokenCounter } from './views/utility/token-counter.js';
import { renderCostCalculator } from './views/utility/cost-calculator.js';
import { renderPromptLinter } from './views/utility/prompt-linter.js';
import { renderLatencyBudget } from './views/utility/latency-budget.js';
import { renderJsonSchema } from './views/utility/json-schema.js';
import { renderSystemPromptAnalyzer } from './views/utility/system-prompt-analyzer.js';
import { renderResumeBullets } from './views/utility/resume-bullets.js';
import { renderPortfolioIdeas } from './views/utility/portfolio-ideas.js';
import { renderCareer } from './views/career.js';

// ---- Register routes ----
registerRoute(/^#?\/?$/, () => renderHome());
registerRoute(/^#\/map3d(?:\?.*)?$/, () => renderMap3D());
registerRoute(/^#\/map(?:\?.*)?$/, (params) => renderSystemMap(params));
registerRoute(/^#\/modules\/?$/, () => renderModulesIndex());
registerRoute(/^#\/module\/(\d+)\/quiz\/?$/, (n) => renderModuleQuiz(n));
registerRoute(/^#\/module\/(\d+)\/stats\/?$/, (n) => renderModuleStats(n));
registerRoute(/^#\/module\/(\d+)\/?$/, (n) => {
  const cs = conceptsForModule(parseInt(n, 10));
  setCycleList(cs.map(c => c.slug));
  setConceptCycleList(cs.map(c => c.slug));
  return renderModulePage(n);
});
registerRoute(/^#\/glossary\/?$/, () => {
  setCycleList(_alphaSlugs);
  setConceptCycleList(_alphaSlugs);
  return renderGlossary();
});
registerRoute(/^#\/concept\/([A-Za-z0-9-]+)\/?$/, (slug) => {
  // Use whatever cycle list the user came from (set by glossary/module).
  return renderConceptPage(slug);
});
registerRoute(/^#\/library\/?$/, () => renderLibrary());
registerRoute(/^#\/playbooks\/?$/, () => renderPlaybooks());
registerRoute(/^#\/playbook\/([A-Za-z0-9-]+)\/?$/, (slug) => renderPlaybookDetail(slug));
registerRoute(/^#\/toolkit\/?$/, () => renderToolkit());
// Utility sub-routes (must come BEFORE the generic toolkit/{type}/{slug} catch).
registerRoute(/^#\/toolkit\/utility\/token-counter\/?$/, () => renderTokenCounter());
registerRoute(/^#\/toolkit\/utility\/cost-calculator\/?$/, () => renderCostCalculator());
registerRoute(/^#\/toolkit\/utility\/prompt-linter\/?$/, () => renderPromptLinter());
registerRoute(/^#\/toolkit\/utility\/latency-budget\/?$/, () => renderLatencyBudget());
registerRoute(/^#\/toolkit\/utility\/json-schema\/?$/, () => renderJsonSchema());
registerRoute(/^#\/toolkit\/utility\/system-prompt-analyzer\/?$/, () => renderSystemPromptAnalyzer());
registerRoute(/^#\/toolkit\/utility\/resume-bullets\/?$/, () => renderResumeBullets());
registerRoute(/^#\/toolkit\/utility\/portfolio-ideas\/?$/, () => renderPortfolioIdeas());
registerRoute(/^#\/career\/?$/, () => renderCareer());
registerRoute(/^#\/toolkit\/([A-Za-z0-9-]+)\/([A-Za-z0-9-]+)\/?$/, (type, slug) => renderToolkitArtifact(type, slug));
registerRoute(/^#\/decisions\/?$/, () => renderDecisions());
registerRoute(/^#\/decision\/([A-Za-z0-9-]+)\/?$/, (slug) => renderDecisionDetail(slug));
registerRoute(/^#\/profile\/?$/, () => renderProfile());
registerRoute(/^#\/settings(?:\?(.*))?\/?$/, (qs) => {
  const params = {};
  if (qs) for (const part of qs.split('&')) {
    const [k, v] = part.split('=');
    if (k) params[decodeURIComponent(k)] = v ? decodeURIComponent(v) : '';
  }
  return renderSettings(params);
});
registerRoute(/^#\/onboarding\/?$/, () => renderOnboarding());
registerRoute(/^#\/path\/?$/, () => renderPath());
registerRoute(/^#\/topics\/?$/, () => renderTopics());
registerRoute(/^#\/topics\/([A-Za-z0-9-]+)\/?$/, (id) => renderTopic(id));
registerRoute(/^#\/history\/?$/, () => renderHistory());
registerRoute(/^#\/share\/([A-Za-z0-9_\-]+)\/?$/, (token) => renderShare(token));
registerRoute(/^#\/practice\/?$/, () => renderPractice());
registerRoute(/^#\/review\/?$/, () => renderReview());
registerRoute(/^#\/interview\/?$/, () => renderInterview());
registerRoute(/^#\/capstone\/(\d+)\/?$/, (n) => renderCapstone(n));

// ---- Wire rail toggle (mobile) ----
const railToggle = document.getElementById('rail-toggle');
const rail = document.getElementById('rail');
const railScrim = document.getElementById('rail-scrim');
if (railToggle && rail) {
  railToggle.addEventListener('click', () => {
    const open = rail.getAttribute('data-open') === 'true';
    rail.setAttribute('data-open', String(!open));
    railToggle.setAttribute('aria-expanded', String(!open));
  });
  if (railScrim) railScrim.addEventListener('click', () => {
    rail.setAttribute('data-open', 'false');
    railToggle.setAttribute('aria-expanded', 'false');
  });
  rail.addEventListener('click', (e) => {
    if (e.target.matches('a')) {
      rail.setAttribute('data-open', 'false');
      railToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// ---- Boot ----
hydrateTopBar();
maybeShowReveal();
route();

// ---- Live progress in the rail status ----
function refreshRailStatus() {
  const xpEl = document.getElementById('rail-xp');
  const tierEl = document.getElementById('rail-tier');
  const streakEl = document.getElementById('rail-streak');
  if (xpEl || tierEl || streakEl) {
    const xp = window.aise26.lsGet('xp', 0);
    const tier = window.aise26.computeTier(xp);
    const streak = window.aise26.getStreak();
    if (xpEl) xpEl.textContent = xp + ' XP';
    if (tierEl) tierEl.textContent = 'Tier ' + tier.n + ': ' + tier.name;
    if (streakEl) streakEl.textContent = streak.count + 'd';
  }
}
refreshRailStatus();
document.addEventListener('aise26:xp-awarded', refreshRailStatus);
window.addEventListener('hashchange', refreshRailStatus);

// Dev validator: log unresolved cross-refs to console (no UI noise in prod look)
const params = new URLSearchParams(window.location.search);
const devMode = params.has('dev') || /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/i.test(window.location.hostname);
if (devMode) {
  Promise.resolve().then(() => {
    const u = window.aise26.validateCrossRefs();
    if (u.length) console.error('[aise26] dangling cross-refs:', u);
    else console.info('[aise26] dev: all', window.aise26.CONCEPTS.length, 'concepts; 0 dangling refs.');
  });
}

console.info('[aise26] runtime ready, route:', window.location.hash || '#/');
