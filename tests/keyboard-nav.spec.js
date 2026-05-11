// @ts-check
import { test, expect } from '@playwright/test';
import { gotoApp } from './helpers.js';

test.describe('keyboard navigation', () => {
  test('Ctrl/Cmd+K opens command palette', async ({ page }) => {
    await gotoApp(page, '#/');
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(150);
    const open = await page.evaluate(() => document.getElementById('cmd-overlay')?.getAttribute('data-open'));
    expect(open).toBe('true');
  });

  test('/ also opens command palette', async ({ page }) => {
    await gotoApp(page, '#/');
    await page.keyboard.press('/');
    await page.waitForTimeout(150);
    const open = await page.evaluate(() => document.getElementById('cmd-overlay')?.getAttribute('data-open'));
    expect(open).toBe('true');
  });

  test('Esc closes command palette', async ({ page }) => {
    await gotoApp(page, '#/');
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(120);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(120);
    const open = await page.evaluate(() => document.getElementById('cmd-overlay')?.getAttribute('data-open'));
    expect(open).toBe('false');
  });

  test('command palette navigates on Enter', async ({ page }) => {
    await gotoApp(page, '#/');
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(150);
    await page.keyboard.type('embedding');
    await page.waitForTimeout(180);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(150);
    const hash = await page.evaluate(() => window.location.hash);
    expect(hash).toContain('/concept/embedding');
  });

  test('j and k cycle concepts within the active list', async ({ page }) => {
    await gotoApp(page, '#/glossary');
    await page.keyboard.press('j');
    await page.waitForTimeout(80);
    const afterJ = await page.evaluate(() => location.hash);
    expect(afterJ.startsWith('#/concept/')).toBe(true);
    await page.keyboard.press('k');
    await page.waitForTimeout(80);
    const afterK = await page.evaluate(() => location.hash);
    expect(afterK).not.toBe(afterJ);
  });

  test('Cmd/Ctrl+E toggles edit mode on focused editor block', async ({ page }) => {
    await gotoApp(page, '#/concept/embedding');
    // Programmatically focus the display (the page is long; Playwright's
    // auto-scroll-into-view can race with linkifyText).
    await page.evaluate(() => {
      const d = document.querySelector('.editor-block .editor-display');
      if (d) d.focus();
    });
    await page.waitForTimeout(80);
    await page.keyboard.press('Control+e');
    await page.waitForTimeout(150);
    const inEdit = await page.evaluate(() => !!document.querySelector('.editor-textarea'));
    expect(inEdit).toBe(true);
  });
});
