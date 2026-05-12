// @ts-check
import { test, expect } from '@playwright/test';
import { gotoApp, clearStorage } from './helpers.js';

test.describe('localStorage round-trip', () => {
  test('XP, completion, and saved persist across reload', async ({ page }) => {
    await gotoApp(page, '#/concept/embedding');
    await clearStorage(page);
    await page.evaluate(() => {
      const s = { reveal_seen: true, onboarding_seen: true };
      localStorage.setItem('aise26:settings', JSON.stringify(s));
    });
    await page.reload();
    await page.waitForFunction(() => document.querySelector('input#concept-complete-embedding'));

    await page.click('input#concept-complete-embedding');
    await page.click('button.save-toggle');
    await page.waitForTimeout(200);

    const before = await page.evaluate(() => ({
      xp: parseInt(localStorage.getItem('aise26:xp') || '0', 10),
      embedding: localStorage.getItem('aise26:concept:embedding'),
      saved: localStorage.getItem('aise26:saved'),
      conceptCompleteAwarded: localStorage.getItem('aise26:xp_awarded:concept_complete:embedding')
    }));
    expect(before.xp).toBeGreaterThanOrEqual(5);
    expect(before.embedding).toContain('"complete":true');
    expect(before.saved).toContain('"embedding"');
    expect(before.conceptCompleteAwarded).toBe('true');

    await page.reload();
    await page.waitForFunction(() => document.querySelector('input#concept-complete-embedding'));
    const checked = await page.locator('input#concept-complete-embedding').isChecked();
    expect(checked).toBe(true);
    const xpRail = await page.locator('#rail-xp').textContent();
    expect(xpRail).toContain('XP');
  });

  test('reset clears all data-bearing aise26 keys', async ({ page }) => {
    // Visit a non-concept route so post-reset hashchange does not write
    // settings.last_concept (which would resurrect the settings key).
    await gotoApp(page, '#/profile');
    await page.evaluate(() => {
      localStorage.setItem('aise26:xp', '50');
      localStorage.setItem('aise26:concept:token', JSON.stringify({ complete: true }));
      localStorage.setItem('aise26:achievements', JSON.stringify({ first_steps: { unlocked_at: 'now' } }));
      localStorage.setItem('aise26:custom_test_key', 'value');
    });
    await page.evaluate(() => window.aise26.lsResetAll(false));
    await page.waitForTimeout(220);
    const remaining = await page.evaluate(() => {
      const all = Object.keys(localStorage).filter(k => k.startsWith('aise26:'));
      return {
        hasCustom: all.includes('aise26:custom_test_key'),
        hasXp: all.includes('aise26:xp'),
        hasConceptToken: all.includes('aise26:concept:token'),
        hasAchievements: all.includes('aise26:achievements')
      };
    });
    expect(remaining.hasCustom).toBe(false);
    expect(remaining.hasXp).toBe(false);
    expect(remaining.hasConceptToken).toBe(false);
    expect(remaining.hasAchievements).toBe(false);
  });
});
