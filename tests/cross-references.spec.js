// @ts-check
import { test, expect } from '@playwright/test';
import { gotoApp } from './helpers.js';

test.describe('cross-reference engine', () => {
  test('every declared cross-ref resolves', async ({ page }) => {
    await gotoApp(page, '#/');
    const unresolved = await page.evaluate(() => window.aise26.validateCrossRefs());
    expect(unresolved).toEqual([]);
  });

  test('linkifyText auto-wraps concept names in fleshed prose', async ({ page }) => {
    await gotoApp(page, '#/concept/retrieval-augmented-generation-rag');
    const xrefCount = await page.locator('article a.xref').count();
    expect(xrefCount).toBeGreaterThan(0);
  });

  test('see-also list on a concept page has at least one link', async ({ page }) => {
    await gotoApp(page, '#/concept/embedding');
    const seeAlsoLinks = await page.locator('.see-also-list li a').count();
    expect(seeAlsoLinks).toBeGreaterThan(0);
  });

  test('CONCEPTS data has 514 entries fully fleshed across 16 modules', async ({ page }) => {
    await gotoApp(page, '#/');
    const stats = await page.evaluate(() => ({
      total: window.aise26.CONCEPTS.length,
      fleshed: window.aise26.CONCEPTS.filter(c => c.fleshed).length,
      modules: window.aise26.MODULES.length
    }));
    expect(stats.total).toBe(514);
    expect(stats.fleshed).toBe(514);
    expect(stats.modules).toBe(16);
  });

  test('System Map renders 514 nodes', async ({ page }) => {
    await gotoApp(page, '#/map');
    await page.waitForTimeout(2000);
    const a11yNodes = await page.locator('#map-a11y-list li').count();
    expect(a11yNodes).toBe(514);
    const hasCanvas = await page.locator('#map-canvas-wrap canvas').count();
    expect(hasCanvas).toBeGreaterThanOrEqual(1);
  });
});
