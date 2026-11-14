import { test, expect } from '@playwright/test';

const WIDTHS = [320, 360, 390, 430, 768, 1024, 1440];

test.describe('responsive layout', () => {
  for (const width of WIDTHS) {
    test(`/offices has no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/offices');
      await page.waitForSelector('header');
      const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientW = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollW, `overflow at ${width}px`).toBeLessThanOrEqual(clientW + 1);
    });

    test(`/ has no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await page.waitForSelector('header');
      const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientW = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollW, `overflow at ${width}px`).toBeLessThanOrEqual(clientW + 1);
    });
  }
});