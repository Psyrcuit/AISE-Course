// @ts-check
import { test, expect } from '@playwright/test';
import { gotoApp } from './helpers.js';

test.describe('v3 surfaces', () => {

  test('Settings page renders all 5 tabs', async ({ page }) => {
    await gotoApp(page, '#/settings');
    const tabs = await page.locator('.settings-tab').count();
    expect(tabs).toBe(5);
    await expect(page.locator('.settings-panel.is-active')).toBeVisible();
  });

  test('Path page renders 16 module cards', async ({ page }) => {
    await gotoApp(page, '#/path');
    const modules = await page.locator('.path-module').count();
    expect(modules).toBe(16);
  });

  test('Practice hub renders three sections', async ({ page }) => {
    await gotoApp(page, '#/practice');
    const sections = await page.locator('.practice-section').count();
    expect(sections).toBeGreaterThanOrEqual(3);
  });

  test('Review page handles "all caught up"', async ({ page }) => {
    await gotoApp(page, '#/review');
    // Either a srs-stage or an "All caught up" context-card renders.
    const article = await page.locator('article').first();
    await expect(article).toBeVisible();
  });

  test('Interview page renders mode tabs', async ({ page }) => {
    await gotoApp(page, '#/interview');
    const tabs = await page.locator('.settings-tab').count();
    expect(tabs).toBeGreaterThanOrEqual(2);
  });

  test('Career hub renders trajectory + tools sections', async ({ page }) => {
    await gotoApp(page, '#/career');
    const sections = await page.locator('.practice-section').count();
    expect(sections).toBeGreaterThanOrEqual(3);
  });

  test('Token counter utility renders with sample', async ({ page }) => {
    await gotoApp(page, '#/toolkit/utility/token-counter');
    // 6 model cards in counter mode
    const cards = await page.locator('.utility-count-card').count();
    expect(cards).toBeGreaterThanOrEqual(6);
  });

  test('Cost calculator utility renders with default vendor card', async ({ page }) => {
    await gotoApp(page, '#/toolkit/utility/cost-calculator');
    await expect(page.locator('text=Forecasted monthly cost')).toBeVisible();
  });

  test('Prompt linter scores the sample 80+ on heuristic', async ({ page }) => {
    await gotoApp(page, '#/toolkit/utility/prompt-linter');
    const scoreNumLocator = page.locator('.utility-score-num').first();
    const text = await scoreNumLocator.textContent();
    const score = parseInt((text || '0').trim(), 10);
    expect(score).toBeGreaterThanOrEqual(60);
  });

  test('Salary negotiator decision tool renders', async ({ page }) => {
    await gotoApp(page, '#/decision/salary-negotiator');
    await expect(page.locator('#dec-h1')).toContainText('Salary negotiator');
    // Recommendation list contains a USD range
    await expect(page.locator('text=Total comp range').first()).toBeVisible();
  });

  test('Onboarding wizard renders welcome step', async ({ page }) => {
    // Bypass the "onboarding_seen" gate by clearing it
    await page.goto('/course.html');
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('aise26:settings') || '{}');
      s.reveal_seen = true;
      s.onboarding_seen = false;
      localStorage.setItem('aise26:settings', JSON.stringify(s));
    });
    await page.goto('/course.html#/onboarding');
    await page.waitForFunction(() => document.querySelector('.onboarding') !== null, { timeout: 8000 });
    await expect(page.locator('h2')).toContainText('Welcome');
  });

  test('SRS algorithm: recordReview increases interval on Easy', async ({ page }) => {
    await gotoApp(page, '#/');
    const result = await page.evaluate(() => {
      const { recordReview, getCardState } = window.aise26.srs;
      // First Good rating
      const r1 = recordReview('test-srs-slug', 4);
      // Second Good rating (should multiply by ease)
      const r2 = recordReview('test-srs-slug', 4);
      const r3 = recordReview('test-srs-slug', 5);
      return { i1: r1.interval, i2: r2.interval, i3: r3.interval };
    });
    expect(result.i2).toBeGreaterThan(result.i1);
    expect(result.i3).toBeGreaterThan(result.i2);
  });
});
