import { test, expect } from '@playwright/test';

test.describe('navigation', () => {
  test('desktop shows horizontal nav links', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForSelector('header');
    const nav = page.locator('nav[aria-label="Main Navigation"]');
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('link', { name: /schemes/i })).toBeVisible();
  });

  test('mobile hamburger opens, locks scroll, and closes on selection', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForSelector('header');

    const toggle = page.getByRole('button', { name: /open navigation menu/i });
    await expect(toggle).toBeVisible();
    await toggle.click();

    const menu = page.locator('#mobile-navigation');
    await expect(menu).toBeVisible();
    // Background scroll is locked while open.
    const overflow = await page.evaluate(() => document.body.style.overflow);
    expect(overflow).toBe('hidden');

    // Selecting a link closes the menu.
    await menu.getByRole('link', { name: /schemes/i }).click();
    await expect(page).toHaveURL(/\/schemes/);
    await expect(menu).toHaveCount(0);
  });

  test('mobile Sign In control is reachable without clipping', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');
    await page.waitForSelector('header');
    const login = page.getByRole('link', { name: /^sign in$/i }).first();
    await expect(login).toBeVisible();
    // No horizontal overflow at 360px.
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientW = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollW).toBeLessThanOrEqual(clientW + 1);
  });
});