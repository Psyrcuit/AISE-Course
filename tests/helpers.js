// @ts-check
// Helpers used by every spec. baseURL configured in playwright.config.js
// points to the test server.

export async function gotoApp(page, hash = '#/') {
  // Pre-stamp settings to skip the opening reveal + onboarding wizard
  // (both fire on first launch). Done as part of every test boot, then reload.
  await page.goto('/');
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('aise26:settings') || '{}');
    s.reveal_seen = true;
    s.onboarding_seen = true;
    localStorage.setItem('aise26:settings', JSON.stringify(s));
  });
  await page.goto('/' + hash);
  await page.waitForFunction(() => document.querySelector('main#main-region article') !== null, { timeout: 8000 });
}

export async function clearStorage(page) {
  await page.evaluate(() => localStorage.clear());
}
