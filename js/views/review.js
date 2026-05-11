// SRS daily review surface. Pulls due cards via dueToday() and walks them
// one-by-one with a 4-rating UI (Again/Hard/Good/Easy).

import { el, clear, announce } from '../runtime.js';
import { dueToday, recordReview, srsStats } from '../srs.js';
import { FLASHCARDS } from '../flashcards.js';
import { conceptBySlug } from '../crossref.js';
import { awardXP, setConceptState, getConceptState } from '../gamification.js';

export function renderReview() {
  const wrap = el('article', { 'aria-labelledby': 'review-h1', class: 'fade-up' });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'Daily review'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'review-h1' }, 'Review'));

  const stats = srsStats();
  wrap.appendChild(el('p', { style: 'color: var(--text-2);' },
    stats.dueNow + ' cards due. ' + stats.mastered + ' mastered of ' + stats.total + '. ' + stats.seen + ' seen.'
  ));

  const deck = dueToday(20);

  if (!deck.length) {
    wrap.appendChild(el('section', { class: 'context-card' }, [
      el('h3', null, 'All caught up.'),
      el('p', null, 'No cards due. New seed cards will appear tomorrow as you read more concepts.'),
      el('a', { class: 'btn btn-primary', href: '#/practice' }, 'Open practice hub')
    ]));
    return { node: wrap, title: 'Review', crumbs: [{ label: 'Practice', href: '#/practice' }, { label: 'Review' }], mainClass: 'no-rail' };
  }

  let idx = 0;
  let revealed = false;
  const stage = el('section', { class: 'srs-stage' });
  wrap.appendChild(stage);

  function render() {
    clear(stage);
    if (idx >= deck.length) {
      stage.appendChild(el('h2', null, 'Session complete.'));
      stage.appendChild(el('p', null, deck.length + ' cards reviewed. Come back tomorrow.'));
      const back = el('a', { class: 'btn btn-primary', href: '#/practice' }, 'Back to practice hub');
      stage.appendChild(back);
      return;
    }
    const item = deck[idx];
    const card = FLASHCARDS[item.slug];
    const concept = conceptBySlug(item.slug);
    if (!card) { idx++; return render(); }

    stage.appendChild(el('div', { class: 'srs-progress' },
      'Card ' + (idx + 1) + ' / ' + deck.length + (item.seed ? ' · seed' : item.urgency > 0 ? ' · overdue' : '')
    ));

    const flash = el('div', { class: 'srs-card', tabindex: '0', role: 'button', 'aria-pressed': 'false' });
    flash.appendChild(el('div', { class: 'srs-front' }, card.front));
    if (revealed) {
      flash.appendChild(el('div', { class: 'srs-back' }, card.back));
      flash.setAttribute('aria-pressed', 'true');
    }
    function reveal() {
      if (revealed) return;
      revealed = true;
      render();
    }
    flash.addEventListener('click', reveal);
    flash.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); reveal(); }
    });
    stage.appendChild(flash);

    if (concept) {
      stage.appendChild(el('p', { style: 'font-size: var(--fs-100); color: var(--text-3); text-align: center; margin: 8px 0 0;' },
        'Concept: ', el('a', { href: '#/concept/' + concept.slug, style: 'color: var(--text-2);' }, concept.name)
      ));
    }

    if (revealed) {
      const rateRow = el('div', { class: 'srs-rate' });
      const rates = [
        { label: 'Again', q: 0, key: '1', cls: 'is-again' },
        { label: 'Hard', q: 3, key: '2', cls: 'is-hard' },
        { label: 'Good', q: 4, key: '3', cls: 'is-good' },
        { label: 'Easy', q: 5, key: '4', cls: 'is-easy' }
      ];
      for (const r of rates) {
        const b = el('button', {
          class: 'btn srs-rate-btn ' + r.cls,
          type: 'button',
          'aria-keyshortcuts': r.key
        }, [
          el('div', null, r.label),
          el('div', { style: 'font-size: 10px; opacity: 0.6; margin-top: 2px;' }, 'press ' + r.key)
        ]);
        b.addEventListener('click', () => rate(item, r.q));
        rateRow.appendChild(b);
      }
      stage.appendChild(rateRow);
    } else {
      stage.appendChild(el('p', { style: 'font-size: var(--fs-100); color: var(--text-3); text-align: center;' }, 'Click or press Enter / Space to reveal.'));
    }
  }

  function rate(item, quality) {
    const next = recordReview(item.slug, quality);
    // Award XP on first mastery (idempotent via awardXP)
    if (next.mastered) {
      const concept = getConceptState(item.slug);
      if (!concept.flashcard_mastered) {
        setConceptState(item.slug, { flashcard_mastered: true });
        awardXP(5, 'flashcard_mastered', item.slug);
      }
    }
    announce(['Again', null, null, 'Hard', 'Good', 'Easy'][quality] + ' recorded.');
    revealed = false;
    idx++;
    render();
  }

  // Keyboard shortcuts: 1-4 for rating, Space/Enter to reveal
  function onKey(e) {
    if (e.key === '1') rateFromKey(0);
    else if (e.key === '2') rateFromKey(3);
    else if (e.key === '3') rateFromKey(4);
    else if (e.key === '4') rateFromKey(5);
  }
  function rateFromKey(q) {
    if (!revealed || idx >= deck.length) return;
    rate(deck[idx], q);
  }
  document.addEventListener('keydown', onKey);
  // Cleanup when leaving via hashchange
  const cleanup = () => { document.removeEventListener('keydown', onKey); window.removeEventListener('hashchange', cleanup); };
  window.addEventListener('hashchange', cleanup);

  render();

  return {
    node: wrap,
    title: 'Review',
    crumbs: [{ label: 'Practice', href: '#/practice' }, { label: 'Review' }],
    mainClass: 'no-rail'
  };
}
