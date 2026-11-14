import { test, expect } from '@playwright/test';

test.describe('offices', () => {
  test('shows honest empty state (no fabricated offices)', async ({ page }) => {
    await page.goto('/offices');
    await expect(page.getByText(/sample directory/i)).toHaveCount(0);
    await expect(page.getByText(/demo/i)).toHaveCount(0);
  });
});

test.describe('mobile OTP authentication', () => {
  test('request + verify signs the user in', async ({ page }) => {
    // Unique number per run so the resend cooldown never blocks the test.
    const phone = '9' + String(Math.floor(Math.random() * 1_000_000_000)).padStart(9, '0');

    await page.goto('/login');
    await page.getByRole('button', { name: /mobile otp/i }).click();

    await page.getByPlaceholder(/10-digit mobile number/i).fill(phone);

    const [response] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/auth/otp/request') && r.request().method() === 'POST'),
      page.getByRole('button', { name: /send code/i }).click(),
    ]);
    const body = await response.json();
    const code = body.devCode as string;
    expect(code).toMatch(/^\d{6}$/);

    await page.getByPlaceholder(/6-digit code/i).fill(code);

    const [verifyRes] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/auth/otp/verify') && r.request().method() === 'POST'),
      page.getByRole('button', { name: /verify & sign in/i }).click(),
    ]);
    const verifyBody = await verifyRes.json();
    expect(verifyRes.status(), JSON.stringify(verifyBody)).toBe(200);

    // Session cookie must be established.
    const me = await page.request.get('/api/auth/me');
    const meBody = await me.json();
    expect(meBody.user?.phone).toBe(phone);

    // Signed-in view is available on /login.
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
  });
});