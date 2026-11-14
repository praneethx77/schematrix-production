import { test, expect } from '@playwright/test';
import { buildSahayakSystemPrompt } from '../../lib/sahayak';
import { DEMO_SCHEMES, DEMO_SERVICES } from '../../lib/demoData';

const context = { schemes: DEMO_SCHEMES, services: DEMO_SERVICES, offices: [] };

test.describe('buildSahayakSystemPrompt', () => {
  test('grounds on the verified dataset and forbids fabrication', () => {
    const p = buildSahayakSystemPrompt(context, 'en');
    expect(p).toContain('VERIFIED SCHEMES');
    expect(p).toContain(DEMO_SCHEMES[0].name);
    expect(p).toContain('Never invent');
    expect(p).toContain('Never claim an application was submitted');
    expect(p).toContain('not certain');
    expect(p.toLowerCase()).toContain('simple english');
  });

  test('requests Hindi and Telugu when asked', () => {
    expect(buildSahayakSystemPrompt(context, 'hi')).toContain('Hindi');
    expect(buildSahayakSystemPrompt(context, 'te')).toContain('Telugu');
  });
});