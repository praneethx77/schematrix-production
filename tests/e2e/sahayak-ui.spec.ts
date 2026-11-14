import { test, expect, Page } from '@playwright/test';

async function mockSahayak(page: Page, body: unknown, status = 200) {
  await page.route('**/api/sahayak', (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  });
}

async function ask(page: Page, text: string) {
  const box = page.getByRole('textbox');
  await box.waitFor();
  await box.fill(text);
  const send = page.getByRole('button', { name: /^send$/i });
  await expect(send).toBeEnabled();
  await send.click();
}

test.describe('AI Sahayak UI', () => {
  test('shows a live answer and Live AI badge', async ({ page }) => {
    await mockSahayak(page, { text: 'PM-KISAN is for landholding farmer families.', sources: [], mode: 'live' });
    await page.goto('/sahayak');
    await ask(page, 'PM-KISAN eligibility?');
    await expect(page.getByText('PM-KISAN is for landholding farmer families.')).toBeVisible();
    await expect(page.getByText(/^live ai$/i).first()).toBeVisible();
  });

  test('shows built-in info and the unavailable notice when the key is rejected', async ({ page }) => {
    await mockSahayak(page, {
      text: 'Built-in dataset: PM-KISAN supports landholding farmer families.',
      sources: [],
      mode: 'demo',
      error: 'auth',
      notice: 'Live AI is unavailable because the configured API key was rejected. Showing built-in information.',
    });
    await page.goto('/sahayak');
    await ask(page, 'Tell me about a scheme');
    await expect(page.getByText('Built-in dataset: PM-KISAN supports landholding farmer families.')).toBeVisible();
    await expect(page.getByText(/api key was rejected/i)).toBeVisible();
    await expect(page.getByText(/^built-in dataset$/i).first()).toBeVisible();
  });

  test('no horizontal overflow on mobile 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/sahayak');
    await page.waitForSelector('header');
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientW = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollW).toBeLessThanOrEqual(clientW + 1);
  });
});