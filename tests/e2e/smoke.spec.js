import { test, expect } from '@playwright/test';

test.describe('Governance Resource Hub Smoke Tests', () => {
  const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5173';

  test('homepage loads and has title', async ({ page }) => {
    await page.goto(baseUrl);
    await expect(page).toHaveTitle(/Governance Resource Hub/);
  });

  test('library page navigates and loads', async ({ page }) => {
    await page.goto(`${baseUrl}/library`);
    // Basic check for content
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('explore page shows chat input area', async ({ page }) => {
    await page.goto(`${baseUrl}/explore`);
    // Explore page usually has a chat/input area based on previous chats
    const input = page.locator('input, textarea').first();
    await expect(input).toBeVisible();
  });

  test('no major console errors on load', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    await page.goto(baseUrl);
    // Ignore common harmless errors if needed, but aim for zero
    expect(errors.filter(e => !e.includes('Sentry'))).toHaveLength(0);
  });
});
