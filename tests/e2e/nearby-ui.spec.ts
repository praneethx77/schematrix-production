import { test, expect, Page } from '@playwright/test';

const iso = new Date().toISOString();

function office(partial: Record<string, unknown>) {
  return {
    id: partial.id,
    name: partial.name,
    category: partial.category,
    address: partial.address ?? '',
    district: partial.district ?? '',
    state: partial.state ?? '',
    pinCode: '',
    phone: '',
    workingHours: '',
    latitude: partial.latitude,
    longitude: partial.longitude,
    officialSource: 'OpenStreetMap',
    sourceUrl: `https://www.openstreetmap.org/${partial.id}`,
    lastReviewedAt: iso,
    distanceKm: partial.distanceKm,
    sourceType: 'osm',
    externalId: partial.id,
    attribution: '© OpenStreetMap contributors',
    fetchedAt: iso,
  };
}

const FIXTURE = {
  offices: [
    office({ id: 'osm:node/1', name: 'Rampoor Post Office', category: 'post', address: 'Main Rd, Rampoor', district: 'Warangal', state: 'Telangana', latitude: 17.39, longitude: 78.48, distanceKm: 1.2 }),
    office({ id: 'osm:node/2', name: 'Mandal Revenue Office', category: 'revenue', address: 'Subedari', district: 'Warangal', state: 'Telangana', latitude: 17.41, longitude: 78.5, distanceKm: 3.4 }),
  ],
  count: 2,
  source: 'live',
  attribution: '© OpenStreetMap contributors',
  fetchedAt: iso,
};

async function mockNearby(page: Page, handler: (route: any) => void) {
  await page.route('**/api/offices/nearby**', handler as any);
}

test.describe('nearby offices UI', () => {
  test.use({ geolocation: { latitude: 17.385, longitude: 78.4867 }, permissions: ['geolocation'] });

  test('renders live results sorted by distance', async ({ page }) => {
    await mockNearby(page, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FIXTURE) }));
    await page.goto('/offices');
    await page.getByRole('button', { name: /use my location/i }).click();

    const list = page.getByRole('list', { name: /nearby government offices/i });
    await expect(list.getByText('Rampoor Post Office')).toBeVisible();
    await expect(list.getByText('Mandal Revenue Office')).toBeVisible();

    const items = await list.getByRole('listitem').allInnerTexts();
    expect(items[0]).toContain('Rampoor Post Office');
    expect(items[1]).toContain('Mandal Revenue Office');
  });

  test('category filter narrows results', async ({ page }) => {
    await mockNearby(page, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FIXTURE) }));
    await page.goto('/offices');
    await page.getByRole('button', { name: /use my location/i }).click();
    await page.getByRole('button', { name: 'Post Office', exact: true }).click();
    const list = page.getByRole('list', { name: /nearby government offices/i });
    await expect(list.getByText('Rampoor Post Office')).toBeVisible();
    await expect(list.getByText('Mandal Revenue Office')).toHaveCount(0);
  });

  test('shows empty state when no offices found', async ({ page }) => {
    await mockNearby(page, (r) =>
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ offices: [], count: 0, source: 'live', attribution: '© OpenStreetMap contributors', fetchedAt: iso }) })
    );
    await page.goto('/offices');
    await page.getByRole('button', { name: /use my location/i }).click();
    await expect(page.getByText(/no offices found nearby/i)).toBeVisible();
  });

  test('shows error with retry, then recovers', async ({ page }) => {
    let calls = 0;
    await mockNearby(page, (r) => {
      calls += 1;
      if (calls === 1) {
        r.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'boom' }) });
      } else {
        r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FIXTURE) });
      }
    });
    await page.goto('/offices');
    await page.getByRole('button', { name: /use my location/i }).click();
    await expect(page.getByText(/live office discovery is temporarily unavailable/i)).toBeVisible();
    await page.getByRole('button', { name: /^retry$/i }).click();
    await expect(page.getByText('Rampoor Post Office')).toBeVisible();
  });

  test('manual coordinates trigger a nearby request', async ({ page }) => {
    const urls: string[] = [];
    await mockNearby(page, (r) => {
      urls.push(r.request().url());
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FIXTURE) });
    });
    await page.goto('/offices');
    // Wait for hydration before typing: on slower engines (tablet WebKit) the
    // controlled inputs can drop the first fill while React attaches onChange,
    // leaving latitude empty (submitted as lat=0).
    const latInput = page.getByPlaceholder('17.3850');
    const lngInput = page.getByPlaceholder('78.4867');
    await expect(latInput).toBeVisible();
    await page.waitForLoadState('networkidle');
    await latInput.fill('17.42');
    await expect(latInput).toHaveValue('17.42');
    await lngInput.fill('78.51');
    await expect(lngInput).toHaveValue('78.51');
    await page.getByRole('button', { name: /^search$/i }).click();
    await expect(page.getByText('Rampoor Post Office')).toBeVisible();
    expect(urls.some((u) => u.includes('lat=17.42') && u.includes('lng=78.51'))).toBe(true);
  });

  test('mobile 360px has no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await mockNearby(page, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FIXTURE) }));
    await page.goto('/offices');
    await page.getByRole('button', { name: /use my location/i }).click();
    await expect(page.getByText('Rampoor Post Office')).toBeVisible();
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientW = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollW).toBeLessThanOrEqual(clientW + 1);
  });
});