import { test, expect } from '@playwright/test';

test.describe('GET /api/offices/nearby', () => {
  test('rejects missing coordinates', async ({ request }) => {
    const res = await request.get('/api/offices/nearby');
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  test('rejects out-of-range coordinates', async ({ request }) => {
    const res = await request.get('/api/offices/nearby?lat=200&lng=999');
    expect(res.status()).toBe(400);
  });

  test('degrades honestly when the live provider times out', async ({ request }) => {
    // Unique coordinates so the in-memory cache is not reused.
    const lat = 17 + Math.random() * 0.01;
    const lng = 78 + Math.random() * 0.01;
    const res = await request.get(`/api/offices/nearby?lat=${lat}&lng=${lng}&radius=10000`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.offices)).toBe(true);
    // Overpass is unreachable in the test env -> unavailable (never fabricated).
    expect(['unavailable', 'cache']).toContain(body.source);
    if (body.source === 'unavailable') {
      expect(body.warning).toBeTruthy();
    }
    expect(body.attribution).toContain('OpenStreetMap');
  });
});