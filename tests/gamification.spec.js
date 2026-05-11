// @ts-check
import { test, expect } from '@playwright/test';
import { gotoApp, clearStorage } from './helpers.js';

test.describe('gamification framework', () => {
  test('XP_VALUES and TIERS match GAMIFICATION.md', async ({ page }) => {
    await gotoApp(page, '#/');
    const constants = await page.evaluate(() => ({
      xp: window.aise26.XP_VALUES,
      tiers: window.aise26.TIERS.map(t => ({ n: t.n, name: t.name, threshold: t.threshold }))
    }));
    expect(constants.xp).toEqual({
      CONCEPT_COMPLETE: 5, CONCEPT_QUIZ_PASS: 10, FLASHCARD_MASTERED: 5,
      MODULE_QUIZ_PASS: 50, MODULE_COMPLETE: 200, CAPSTONE_PASS: 100,
      STREAK_7DAY_MILESTONE: 50, STREAK_30DAY_MILESTONE: 200,
      NOTE_WRITTEN_FIRST_TIME: 5, CROSS_REF_CLICKED_X25: 25
    });
    expect(constants.tiers).toEqual([
      { n: 1, name: 'Curious Engineer',          threshold: 0 },
      { n: 2, name: 'Apprentice Builder',        threshold: 250 },
      { n: 3, name: 'Practicing Engineer',       threshold: 750 },
      { n: 4, name: 'AI Engineer',               threshold: 1750 },
      { n: 5, name: 'Solutions Engineer',        threshold: 3500 },
      { n: 6, name: 'Solutions Architect',       threshold: 6000 },
      { n: 7, name: 'Forward Deployed Engineer', threshold: 9000 },
      { n: 8, name: 'Principal Architect',       threshold: 13000 }
    ]);
  });

  test('completing a concept awards XP and is idempotent', async ({ page }) => {
    await gotoApp(page, '#/concept/token');
    await clearStorage(page);
    await page.evaluate(() => localStorage.setItem('aise26:settings', JSON.stringify({ reveal_seen: true })));
    await page.reload();
    await page.waitForFunction(() => document.querySelector('input#concept-complete-token'));
    await page.click('input#concept-complete-token');
    await page.waitForTimeout(200);
    const after1 = await page.evaluate(() => ({
      xp: window.aise26.lsGet('xp', 0),
      marker: window.aise26.lsGet('xp_awarded:concept_complete:token', false)
    }));
    expect(after1.xp).toBeGreaterThanOrEqual(5);
    expect(after1.marker).toBe(true);
    const baseline = after1.xp;
    await page.click('input#concept-complete-token');
    await page.waitForTimeout(80);
    await page.click('input#concept-complete-token');
    await page.waitForTimeout(200);
    const after2 = await page.evaluate(() => window.aise26.lsGet('xp', 0));
    expect(after2).toBe(baseline);
  });

  test('tier-up toast fires when crossing 250 XP', async ({ page }) => {
    await gotoApp(page, '#/');
    await clearStorage(page);
    await page.evaluate(() => {
      localStorage.setItem('aise26:settings', JSON.stringify({ reveal_seen: true }));
      localStorage.setItem('aise26:xp', '249');
    });
    await page.reload();
    await page.waitForFunction(() => document.querySelector('main#main-region article'));
    await page.evaluate(() => {
      document.dispatchEvent(new CustomEvent('aise26:xp-awarded', {
        detail: { amount: 5, action: 'concept_complete', target: 'test', total: 254, prevTotal: 249 }
      }));
    });
    await page.waitForTimeout(150);
    const tierToast = await page.locator('.toast.toast-tier').count();
    expect(tierToast).toBeGreaterThanOrEqual(1);
  });

  test('first concept complete unlocks first_steps achievement', async ({ page }) => {
    await gotoApp(page, '#/concept/inference');
    await clearStorage(page);
    await page.evaluate(() => localStorage.setItem('aise26:settings', JSON.stringify({ reveal_seen: true })));
    await page.reload();
    await page.waitForFunction(() => document.querySelector('input#concept-complete-inference'));
    await page.click('input#concept-complete-inference');
    await page.waitForTimeout(300);
    const ach = await page.evaluate(() => Object.keys(window.aise26.getAchievements()));
    expect(ach).toContain('first_steps');
  });

  test('original 20 achievements preserved with exact bonus values', async ({ page }) => {
    await gotoApp(page, '#/');
    const reg = await page.evaluate(() =>
      window.aise26.ACHIEVEMENTS_REGISTRY.map(a => ({ id: a.id, bonusXP: a.bonusXP }))
    );
    // v5 expanded the registry; original 20 must still be present with same XP.
    expect(reg.length).toBeGreaterThanOrEqual(20);
    const expected = {
      first_steps: 10, vocab_explorer: 50, builder: 100, rag_whisperer: 75,
      architect: 50, polyglot: 10, speedrunner: 75, persistent: 50,
      iron_mind: 200, stack_master: 500, cross_referencer: 25,
      note_taker: 50, saver: 25, capstone_crusher: 150, boss_slayer: 500,
      local_hero: 100, recruiter_ready: 100, compliance_officer: 100,
      encyclopedia: 250, self_taught: 50
    };
    const byId = Object.fromEntries(reg.map(a => [a.id, a.bonusXP]));
    for (const id of Object.keys(expected)) expect(byId[id]).toBe(expected[id]);
  });

  test('capstone pass threshold uses Math.ceil(total * 0.66)', async ({ page }) => {
    await gotoApp(page, '#/');
    const checks = await page.evaluate(() => ({
      t4: window.aise26.passThreshold(4),
      t5: window.aise26.passThreshold(5),
      t6: window.aise26.passThreshold(6),
      t8: window.aise26.passThreshold(8),
      t10: window.aise26.passThreshold(10)
    }));
    expect(checks).toEqual({ t4: 3, t5: 4, t6: 4, t8: 6, t10: 7 });
  });
});
