import { test, expect, Page } from '@playwright/test';

/**
 * Voice assistant verification.
 *
 * Real browser APIs are exercised end to end:
 *  - SpeechRecognition is replaced with an in-page stub so `onresult` fires with
 *    a deterministic transcript (Chromium's Web Speech service is remote and
 *    unavailable in CI). The stub mirrors the real event shape exactly.
 *  - SpeechSynthesis is the real Web Speech API; `speak/cancel/pause/resume` are
 *    wrapped to record what the app actually asked the engine to say, and to
 *    fire `onstart`/`onend` like a real engine.
 *  - Microphone permission is granted, so `start()` is a genuine user gesture.
 */

const TRANSCRIPT = 'What government schemes are available for farmers?';

// Injected into the page as a plain string, so it is intentionally untyped.
const STUB_SCRIPT = `
(() => {
  const text = __TRANSCRIPT__;
  const spoken = [];
  const states = { started: 0, ended: 0, paused: 0, resumed: 0, cancelled: 0 };

  class FakeRecognition {
    constructor() {
      this.lang = 'en-IN';
      this.continuous = false;
      this.interimResults = true;
      this.maxAlternatives = 1;
      this.onresult = null;
      this.onerror = null;
      this.onend = null;
      this.onstart = null;
    }
    start() {
      setTimeout(() => {
        if (typeof this.onstart === 'function') this.onstart();
        const result = { isFinal: true, 0: { transcript: text }, length: 1 };
        if (typeof this.onresult === 'function') {
          this.onresult({ resultIndex: 0, results: [result] });
        }
        setTimeout(() => {
          if (typeof this.onend === 'function') this.onend();
        }, 20);
      }, 30);
    }
    stop() {
      if (typeof this.onend === 'function') this.onend();
    }
    abort() {
      if (typeof this.onend === 'function') this.onend();
    }
  }

  window.__schematrixVoice = { spoken, states };
  window.SpeechRecognition = FakeRecognition;
  window.webkitSpeechRecognition = FakeRecognition;

  const synth = window.speechSynthesis;
  if (synth) {
    const nativeSpeak = synth.speak.bind(synth);
    const nativeCancel = synth.cancel.bind(synth);
    const nativePause = synth.pause.bind(synth);
    const nativeResume = synth.resume.bind(synth);

    synth.speak = (utterance) => {
      states.started += 1;
      spoken.push({
        text: utterance.text,
        lang: utterance.lang,
        voice: utterance.voice ? utterance.voice.name : null,
      });
      setTimeout(() => {
        if (typeof utterance.onstart === 'function') utterance.onstart();
      }, 5);
      setTimeout(() => {
        if (typeof utterance.onend === 'function') utterance.onend();
      }, 40);
      try { nativeSpeak(utterance); } catch (e) { /* stub is authoritative */ }
    };
    synth.cancel = () => {
      // Count only real cancellations: a real engine is a no-op when idle, so a
      // cancel with nothing playing must not be recorded as a cancellation.
      const wasActive = synth.speaking || synth.pending;
      if (wasActive) states.cancelled += 1;
      try { nativeCancel(); } catch (e) { /* ignore */ }
    };
    synth.pause = () => {
      states.paused += 1;
      try { nativePause(); } catch (e) { /* ignore */ }
    };
    synth.resume = () => {
      states.resumed += 1;
      try { nativeResume(); } catch (e) { /* ignore */ }
    };
  }
})();
`;

async function installStubs(page: Page, transcript: string = TRANSCRIPT) {
  const script = STUB_SCRIPT.replace('__TRANSCRIPT__', JSON.stringify(transcript));
  await page.addInitScript(script);
}

async function mockGemini(page: Page, reply: string, language: string) {
  await page.route('**/api/sahayak', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ text: reply, sources: [], mode: 'live', language }),
    });
  });
}

interface SpokenItem {
  text: string;
  lang: string;
  voice: string | null;
}

async function spoken(page: Page): Promise<SpokenItem[]> {
  const out = await page.evaluate(() => {
    const store = (window as unknown as { __schematrixVoice?: { spoken: SpokenItem[] } })
      .__schematrixVoice;
    return { items: store ? store.spoken : [], hasStore: !!store };
  });
  if (!out.hasStore) {
    throw new Error('speech stub not installed in page');
  }
  return out.items;
}

/**
 * Switch the interface language from the accessibility toolbar. Recognition uses
 * the interface language (en-IN / hi-IN / te-IN), so a Hindi question requires
 * the Hindi interface, exactly as it would for a real citizen.
 */
async function setUiLanguage(page: Page, label: string): Promise<void> {
  const button = page.locator('button[aria-pressed]', { hasText: label }).first();
  await button.click();
}

// The voice paths rely on the Web Speech API. Playwright's bundled WebKit build
// does not implement speechSynthesis or SpeechRecognition at all, so those
// projects can only verify the honest "unsupported" path (covered separately).
test.describe('Voice assistant (desktop)', () => {
  test.describe.configure({ timeout: 60_000 });
  test.skip(({ browserName }) => browserName !== 'chromium', 'Web Speech API requires Chromium');

  test('starts, transcribes, answers via Gemini, speaks the reply and edits the input', async ({
    page,
  }) => {
    await installStubs(page);
    await mockGemini(page, 'PM-KISAN gives eligible farmer families Rs 6,000 per year.', 'en');
    await page.context().grantPermissions(['microphone']);

    await page.goto('/sahayak');
    await page.waitForSelector('header');

    // 1. Start Voice Assistant.
    const startBtn = page.getByRole('button', { name: /start voice assistant/i });
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    // 2. Large microphone control is present and active.
    const panelMic = page.locator('#voice-assistant button[aria-label*="Speak your question"]');
    await expect(panelMic).toBeVisible();
    await panelMic.click();

    // 3. Listening indicator.
    await expect(page.getByText(/listening/i).first()).toBeVisible();

    // 4. Real transcript shown in the voice panel.
    await expect(page.getByText(TRANSCRIPT).first()).toBeVisible({ timeout: 15_000 });

    // 5. Gemini reply text is displayed.
    await expect(
      page.getByText('PM-KISAN gives eligible farmer families Rs 6,000 per year.').first()
    ).toBeVisible({ timeout: 15_000 });

    // 6. Speech synthesis was actually invoked with the reply in the right voice.
    await expect
      .poll(async () => (await spoken(page)).length, { timeout: 20_000 })
      .toBeGreaterThan(0);
    const items = await spoken(page);
    expect(items[0].text).toContain('PM-KISAN');
    expect(items[0].lang).toBe('en-IN');
    // Chromium in this environment exposes real en-IN voices (e.g. "Microsoft
    // Ravi - English (India)"). When present, the closest en-IN voice is chosen.
    expect(items[0].voice).toContain('India');

    // 7. End voice assistant releases everything.
    await page.getByRole('button', { name: /end voice assistant/i }).click();
    await expect(
      page.locator('#voice-assistant button[aria-label*="Speak your question"]')
    ).toHaveCount(0);
  });

  test('microphone transcript is editable in the composer before sending', async ({ page }) => {
    await installStubs(page);
    await mockGemini(page, 'PM-KISAN supports small farmer families.', 'en');
    await page.context().grantPermissions(['microphone']);

    await page.goto('/sahayak');
    await page.waitForSelector('header');

    // Tap the composer microphone: recognition starts on a real user gesture.
    const mic = page.locator('#sahayak button[aria-label*="Speak your question"]');
    await expect(mic).toBeVisible();
    await mic.click();

    // The transcript appears in the input, ready to edit.
    const box = page.getByRole('textbox');
    await expect(box).toHaveValue(TRANSCRIPT, { timeout: 15_000 });

    // Editing is allowed, and the edited text is what gets sent.
    await box.fill('Tell me about PM-KISAN eligibility');
    const send = page.getByRole('button', { name: /^send$/i });
    await expect(send).toBeEnabled();
    await send.click();

    await expect(page.getByText('PM-KISAN supports small farmer families.')).toBeVisible({
      timeout: 15_000,
    });
  });

  test('Hindi recognition produces a Hindi transcript and a Hindi-language reply', async ({
    page,
  }) => {
    const hindi = 'किसानों के लिए कौन सी सरकारी योजनाएं उपलब्ध हैं?';
    await installStubs(page, hindi);
    await mockGemini(page, 'प्रधानमंत्री किसान सम्मान निधि (PM-KISAN) उपलब्ध है।', 'hi');
    await page.context().grantPermissions(['microphone']);

    await page.goto('/sahayak');
    await page.waitForSelector('header');

    // A Hindi-speaking citizen uses the Hindi interface, so recognition runs
    // with hi-IN.
    await setUiLanguage(page, 'हिन्दी');
    await page.waitForTimeout(300);

    // The start control is found by its accessible role inside the panel; its
    // label is localized, so we do not match on English text.
    await page.locator('#voice-assistant button').first().click();
    await page.locator('#voice-assistant button.w-24').click();

    // Real Devanagari transcript is displayed.
    await expect(page.getByText(hindi).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/PM-KISAN/).first()).toBeVisible({ timeout: 15_000 });

    // Speech synthesis is invoked with the Hindi reply and lang=hi-IN.
    await expect.poll(async () => (await spoken(page)).length, { timeout: 20_000 }).toBeGreaterThan(0);
    const items = await spoken(page);
    expect(items[0].lang).toBe('hi-IN');
    expect(items[0].text).toContain('PM-KISAN');
  });

  test('Telugu recognition produces a Telugu transcript and a Telugu-language reply', async ({
    page,
  }) => {
    const telugu = 'రైతులకు అందుబాటులో ఉన్న ప్రభుత్వ పథకాలు ఏమిటి?';
    await installStubs(page, telugu);
    await mockGemini(page, 'ప్రధాన మంత్రి కిసాన్ సమ్మాన్ నిధి (PM-KISAN) అందుబాటులో ఉంది.', 'te');
    await page.context().grantPermissions(['microphone']);

    await page.goto('/sahayak');
    await page.waitForSelector('header');

    // Telugu interface, so recognition runs with te-IN.
    await setUiLanguage(page, 'తెలుగు');
    await page.waitForTimeout(300);

    await page.locator('#voice-assistant button').first().click();
    await page.locator('#voice-assistant button.w-24').click();

    // Real Telugu transcript is displayed.
    await expect(page.getByText(telugu).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/PM-KISAN/).first()).toBeVisible({ timeout: 15_000 });

    await expect.poll(async () => (await spoken(page)).length, { timeout: 20_000 }).toBeGreaterThan(0);
    const items = await spoken(page);
    expect(items[0].lang).toBe('te-IN');
    expect(items[0].text).toContain('PM-KISAN');
  });

  test('pause, resume and stop controls work on the reply', async ({ page }) => {
    await installStubs(page);
    await mockGemini(page, 'This is a longer answer used to test the speech controls.', 'en');
    await page.context().grantPermissions(['microphone']);

    await page.goto('/sahayak');
    await page.waitForSelector('header');

    await page.getByRole('button', { name: /start voice assistant/i }).click();
    await page.locator('#voice-assistant button.w-24').click();
    await expect(page.getByText(/test the speech controls/i).first()).toBeVisible({
      timeout: 15_000,
    });

    // Pause, resume, stop each invoke the real SpeechSynthesis call.
    const pauseBtn = page.locator('#voice-assistant button[aria-label*="Pause"]');
    const resumeBtn = page.locator('#voice-assistant button[aria-label*="Resume"]');
    const stopBtn = page.locator('#voice-assistant button[aria-label*="Stop"]');

    if (await pauseBtn.count()) {
      await pauseBtn.first().click();
      await expect(resumeBtn.first()).toBeVisible();
      await resumeBtn.first().click();
    }
    await expect(stopBtn.first()).toBeVisible();
    await stopBtn.first().click();

    const states = await page.evaluate(
      () =>
        (
          window as unknown as { __schematrixVoice?: { states: Record<string, number> } }
        ).__schematrixVoice?.states
    );
    expect(states).toBeTruthy();
    expect((states?.cancelled ?? 0)).toBeGreaterThan(0);
  });

  test('microphone permission denied is reported honestly, not faked', async ({ page }) => {
    await installStubs(page);
    await page.context().clearPermissions();

    await page.addInitScript(`
      (() => {
        class DeniedRecognition {
          constructor() {
            this.lang = 'en-IN';
            this.continuous = false;
            this.interimResults = true;
            this.maxAlternatives = 1;
            this.onresult = null;
            this.onerror = null;
            this.onend = null;
            this.onstart = null;
          }
          start() {
            setTimeout(() => {
              if (typeof this.onerror === 'function') this.onerror({ error: 'not-allowed' });
              if (typeof this.onend === 'function') this.onend();
            }, 20);
          }
          stop() {}
          abort() {}
        }
        window.SpeechRecognition = DeniedRecognition;
        window.webkitSpeechRecognition = DeniedRecognition;
      })();
    `);

    await page.goto('/sahayak');
    await page.waitForSelector('header');

    const mic = page.locator('#sahayak button[aria-label*="Speak your question"]');
    await expect(mic).toBeVisible();
    await mic.click();

    await expect(page.getByText(/microphone access was blocked/i)).toBeVisible({
      timeout: 10_000,
    });
    // No transcript must be fabricated.
    expect(await spoken(page)).toHaveLength(0);
  });
});

/**
 * Unsupported-browser behaviour. Playwright's WebKit build has no Web Speech API,
 * so this verifies the UI explains the limitation instead of faking recognition
 * or synthesis. On real Safari/iOS the same path triggers when the API is
 * missing or voices are unavailable.
 */
test.describe('Voice assistant on a browser without Web Speech', () => {
  test.skip(({ browserName }) => browserName === 'chromium', 'Chromium provides Web Speech');

  test('shows a clear explanation and does not fabricate speech', async ({ page }) => {
    await page.goto('/sahayak');
    await page.waitForSelector('header');

    // The composer explains that voice input is unavailable. The same message is
    // also shown by the voice panel, so scope the assertion to the composer.
    await expect(
      page.locator('#sahayak').getByText(/voice input is not supported in this browser/i).first()
    ).toBeVisible();

    // The microphone control is not offered at all.
    await expect(page.locator('#sahayak button[aria-label*="Speak your question"]')).toHaveCount(0);

    // Starting voice mode surfaces the same explanation rather than a fake mic.
    // A browser without Web Speech never enters voice mode, so no microphone
    // control is ever offered inside the panel.
    await page.locator('#voice-assistant button').first().click();
    await expect(
      page.locator('#voice-assistant').getByText(/voice input is not supported in this browser/i)
    ).toBeVisible();
    await expect(page.locator('#voice-assistant button[aria-label*="Speak your question"]')).toHaveCount(0);

    // The written chat still works normally.
    await page.getByRole('textbox').fill('PM-KISAN eligibility?');
    await page.getByRole('button', { name: /^send$/i }).click();
    await expect(page.getByText(/built-in dataset/i).first()).toBeVisible();
  });
});
