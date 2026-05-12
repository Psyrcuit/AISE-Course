// 365-day activity heatmap component. GitHub-style grid.
// Reads aise26:activity.YYYY-MM-DD keys via getActivityByDay().

import { el, getActivityByDay } from '../runtime.js';

const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Render a 53-week x 7-day grid ending today.
 * Returns a DOM node ready to append.
 */
export function renderHeatmap({ days = 365, label = 'Daily activity' } = {}) {
  const wrap = el('div', { class: 'heatmap', role: 'img', 'aria-label': label });
  const data = getActivityByDay(days);

  // Compute the day at the start of the first week (Sunday), aligned to today
  const today = _utcDateOnly(new Date());
  // Days since today; pad so the rightmost column ends on today
  const todayDow = today.getUTCDay();    // 0 Sun .. 6 Sat
  const totalDays = days;                // visible days

  const cells = [];                      // [{date, count, level, idx}]
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(today.getTime() - i * 86_400_000);
    const k = _key(d);
    const count = data[k] || 0;
    cells.unshift({ date: d, key: k, count, level: _level(count) });
  }
  // Pad start to start on a Sunday (data[0] is the oldest day)
  const oldest = cells[0].date;
  const padStart = oldest.getUTCDay();   // 0 if already Sunday
  for (let p = 0; p < padStart; p++) {
    cells.unshift({ date: null, count: 0, level: -1 });
  }
  // Pad end to end on today's column (no extra padding past today)
  const padEnd = 6 - todayDow;
  for (let p = 0; p < padEnd; p++) {
    cells.push({ date: null, count: 0, level: -1 });
  }

  // Build the grid (CSS uses display: grid + grid-auto-flow: column)
  const grid = el('div', { class: 'heatmap-grid' });
  let lastMonthMarker = null;
  for (let i = 0; i < cells.length; i++) {
    const c = cells[i];
    const cell = el('div', {
      class: 'heatmap-cell heatmap-l' + (c.level === -1 ? 'p' : c.level),
      'aria-hidden': 'true'
    });
    if (c.date) {
      cell.title = _humanDate(c.date) + ' - ' + (c.count > 0 ? (c.count + (c.count === 1 ? ' action' : ' actions')) : 'no activity');
      cell.setAttribute('data-date', c.key);
    }
    grid.appendChild(cell);
  }

  // Month labels (spanning across columns)
  const months = el('div', { class: 'heatmap-months', 'aria-hidden': 'true' });
  let lastMonth = -1;
  // Roughly: one label per column where the month changes on the top-row cell
  for (let col = 0; col < Math.ceil(cells.length / 7); col++) {
    const idx = col * 7;
    const c = cells[idx];
    let label = '';
    if (c.date) {
      const m = c.date.getUTCMonth();
      if (m !== lastMonth) {
        label = MONTH_LABELS[m];
        lastMonth = m;
      }
    }
    months.appendChild(el('div', { class: 'heatmap-month' }, label));
  }

  // Day-of-week labels (sparse: Mon, Wed, Fri)
  const dows = el('div', { class: 'heatmap-dows', 'aria-hidden': 'true' });
  for (let r = 0; r < 7; r++) {
    dows.appendChild(el('div', { class: 'heatmap-dow' }, (r === 1 || r === 3 || r === 5) ? DOW_LABELS[r] : ''));
  }

  // Legend
  const legend = el('div', { class: 'heatmap-legend' }, [
    el('span', { class: 'heatmap-legend-label' }, 'Less'),
    el('div', { class: 'heatmap-cell heatmap-l0' }),
    el('div', { class: 'heatmap-cell heatmap-l1' }),
    el('div', { class: 'heatmap-cell heatmap-l2' }),
    el('div', { class: 'heatmap-cell heatmap-l3' }),
    el('div', { class: 'heatmap-cell heatmap-l4' }),
    el('span', { class: 'heatmap-legend-label' }, 'More')
  ]);

  wrap.appendChild(months);
  const inner = el('div', { class: 'heatmap-body' });
  inner.appendChild(dows);
  inner.appendChild(grid);
  wrap.appendChild(inner);
  wrap.appendChild(legend);

  // Anchor the scroll position to the right edge once the heatmap is in
  // the DOM. The grid is 53 columns of 12px cells (~740px wide); on a
  // mobile viewport the visible window is ~330px. Without this, the
  // default view shows the OLDEST week and the user has to swipe right
  // to find today's activity. Scroll-to-end flips that: today sits at
  // the right edge, swipe left walks back through time.
  queueMicrotask(() => {
    requestAnimationFrame(() => {
      if (wrap.scrollWidth > wrap.clientWidth) {
        wrap.scrollLeft = wrap.scrollWidth - wrap.clientWidth;
      }
    });
  });

  return wrap;
}

function _level(count) {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}
function _utcDateOnly(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
function _key(d) {
  return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
}
function _humanDate(d) {
  const opts = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' };
  try { return d.toLocaleDateString(undefined, opts); } catch { return _key(d); }
}
