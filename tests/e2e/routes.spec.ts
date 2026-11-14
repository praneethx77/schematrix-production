import { test, expect } from '@playwright/test';

const ROUTES = [
  '/',
  '/schemes',
  '/services',
  '/offices',
  '/eligibility',
  '/vault',
  '/sahayak',
  '/login',
];

test.describe('routes', () => {
  for (const route of ROUTES) {
    test(`GET ${route} returns 200`, async ({ page }) => {
      const res = await page.goto(route);
      expect(res?.status()).toBe(200);
    });
  }

  test('home has no console or hydration errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Ignore benign resource-load failures (e.g. the Vercel Analytics beacon on
    // localhost). Real hydration/React errors are not "Failed to load resource".
    const meaningful = errors.filter((e) => !/^Failed to load resource/i.test(e));
    expect(meaningful, meaningful.join('\n')).toHaveLength(0);
  });
});