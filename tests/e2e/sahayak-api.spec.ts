import { test, expect } from '@playwright/test';

test.describe('GET /api/sahayak status', () => {
  test('reports configuration without exposing the key', async ({ request }) => {
    const res = await request.get('/api/sahayak');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(typeof body.configured).toBe('boolean');
    expect(typeof body.model).toBe('string');
    expect(body.sdk).toBe('@google/genai');
    expect(body).not.toHaveProperty('apiKey');
    expect(JSON.stringify(body)).not.toMatch(/AIza[0-9A-Za-z_\-]{10,}/);
  });
});

test.describe('POST /api/sahayak', () => {
  test('validates empty message', async ({ request }) => {
    const res = await request.post('/api/sahayak', { data: { message: '' } });
    expect(res.status()).toBe(400);
  });

  test('answers a scheme question and never leaks the key', async ({ request }) => {
    const res = await request.post('/api/sahayak', {
      data: { message: 'Who is eligible for PM-KISAN and what documents are needed?', language: 'en' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(typeof body.text).toBe('string');
    expect(body.text.length).toBeGreaterThan(0);
    expect(['live', 'demo']).toContain(body.mode);
    expect(body).not.toHaveProperty('apiKey');

    // The API key must never appear in the response body.
    const serialized = JSON.stringify(body);
    const key = process.env.GEMINI_API_KEY;
    if (key) expect(serialized).not.toContain(key);
    expect(serialized).not.toMatch(/AIza[0-9A-Za-z_\-]{10,}/);

    // When falling back, it must be clearly identified as built-in.
    if (body.mode === 'demo') {
      expect(typeof body.notice).toBe('string');
      expect(body.notice.length).toBeGreaterThan(0);
    }
  });
});