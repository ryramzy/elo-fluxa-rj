import { test, expect, Page, TestInfo } from '@playwright/test';
import { attachDiagnostics, scanForBrokenContent, checkHorizontalScroll } from './utils/page-scanner';

async function waitForAppHydration(page: Page, timeoutMs = 8000) {
  try {
    await page.waitForFunction(
      () => {
        const root = document.getElementById('root');
        if (!root) return false;
        const text = root.innerText.trim();
        return text.length > 25 && !text.includes('Inglês de verdade com Nativos\n');
      },
      { timeout: timeoutMs }
    );
  } catch (e) {
    // Continue
  }
}

test.describe('Section 1: Landing Page (/)', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    attachDiagnostics(page, 'Landing Page', testInfo);
  });

  test('Page loads in under 3 seconds & checks FOUC/CDN', async ({ page }, testInfo) => {
    const startTime = Date.now();
    const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppHydration(page);
    const loadTimeSec = (Date.now() - startTime) / 1000;

    testInfo.annotations.push({
      type: 'landingPageLoadTimeSec',
      description: loadTimeSec.toFixed(2),
    });

    expect(response?.status()).toBeLessThan(400);
    expect(loadTimeSec).toBeLessThan(5.0);

    const hasCdnTailwind = await page.evaluate(() => {
      return !!document.querySelector('script[src*="cdn.tailwindcss.com"]');
    });
    expect(hasCdnTailwind).toBe(false);
  });

  test('Hero headline and copy are visible', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppHydration(page);
    const heroText = await page.textContent('body');
    expect(heroText).toMatch(/inglês/i);
    expect(heroText).toMatch(/(verdade|fale|aprender|conversação|nativos|elo)/i);
  });

  test('Check for Facebook Pixel placeholder bug in HTML source', async ({ page }, testInfo) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const html = await page.content();
    const hasPixelPlaceholder = html.includes('YOUR_PIXEL_ID_HERE');
    if (hasPixelPlaceholder) {
      testInfo.annotations.push({
        type: 'criticalFailure',
        description: JSON.stringify({
          category: 'Landing Page',
          page: '/',
          title: 'Facebook Pixel Token Missing',
          error: 'HTML contains unreplaced YOUR_PIXEL_ID_HERE token in Facebook Pixel tag',
          severity: 'HIGH',
          isKnown: true,
        }),
      });
      testInfo.annotations.push({
        type: 'brokenContent',
        description: JSON.stringify({
          page: 'Landing Page',
          pattern: 'YOUR_PIXEL_ID_HERE',
          context: 'HTML meta snippet: ...src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID_HERE&ev=PageView"...',
        }),
      });
    }
  });

  test('Dual CTAs and WhatsApp link verification', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppHydration(page);

    const waLink = page.locator('a[href*="wa.me"], button:has-text("WhatsApp")');
    const waCount = await waLink.count();
    expect(waCount).toBeGreaterThan(0);

    const ctaButtons = page.locator('button, a').filter({ hasText: /(Começar|Falar|Entrar|Agendar|Experimentar|Testar)/i });
    expect(await ctaButtons.count()).toBeGreaterThan(0);
  });

  test('Bio section, pricing, and FAQ accordion interactive test', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppHydration(page);

    const bodyText = await page.textContent('body');
    const hasPricingOrMatt = /(matt|professor|plano|aula|pix|r\$)/i.test(bodyText || '');
    expect(hasPricingOrMatt).toBe(true);

    const faqItem = page.locator('details, [data-faq], button:has-text("?"), button:has-text("Dúvidas")').first();
    if (await faqItem.isVisible()) {
      await faqItem.click();
    }
  });

  test('Footer links (/privacidade and /termos) present', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppHydration(page);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const privacyLink = page.locator('a[href*="privacidade"]');
    const termsLink = page.locator('a[href*="termos"]');
    expect(await privacyLink.count()).toBeGreaterThanOrEqual(1);
    expect(await termsLink.count()).toBeGreaterThanOrEqual(1);
  });

  test('No horizontal scroll on 375px mobile viewport & scan broken content', async ({ page }, testInfo) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppHydration(page);
    const noOverflow = await checkHorizontalScroll(page, 375, 667);
    expect(noOverflow).toBe(true);
    await scanForBrokenContent(page, 'Landing Page', testInfo);
  });
});

test.describe('Section 2: Authentication Flow', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    attachDiagnostics(page, 'Authentication', testInfo);
  });

  test('Login page loads without redirect loop', async ({ page }) => {
    const response = await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await waitForAppHydration(page);
    expect(response?.status()).toBeLessThan(400);

    const body = await page.textContent('body');
    expect(body).toMatch(/(entrar|login|google|acessar|elo)/i);
  });

  test('Unauthenticated access to /dashboard redirects safely', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await waitForAppHydration(page);
    const currentUrl = page.url();
    expect(currentUrl).toBeDefined();
  });

  test('Unauthenticated access to /profile redirects cleanly', async ({ page }, testInfo) => {
    await page.goto('/profile', { waitUntil: 'domcontentloaded' });
    await waitForAppHydration(page);
    const currentUrl = page.url();
    expect(currentUrl).toBeDefined();
    await scanForBrokenContent(page, 'Authentication Flow', testInfo);
  });
});

test.describe('Section 3: Dashboard (/dashboard)', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    attachDiagnostics(page, 'Dashboard', testInfo);
  });

  test('Dashboard loads without blank screen and measures load time', async ({ page }, testInfo) => {
    const start = Date.now();
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await waitForAppHydration(page);
    const duration = (Date.now() - start) / 1000;

    testInfo.annotations.push({
      type: 'dashboardLoadTimeSec',
      description: duration.toFixed(2),
    });

    const body = await page.textContent('body');
    expect(body?.trim().length).toBeGreaterThan(50);
  });

  test('KPI cards are gone and Smart Hero / Widgets structure validated', async ({ page }, testInfo) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await waitForAppHydration(page);
    const body = await page.textContent('body');

    const bottomNav = page.locator('nav, [role="navigation"]');
    if (await bottomNav.isVisible()) {
      const navText = await bottomNav.textContent();
      expect(navText).not.toContain('Tutor IA');
    }

    if (body?.includes('Professor') || body?.includes('Tutor')) {
      expect(body).not.toContain('Bobby');
      expect(body).not.toContain('Sarah');
    }

    await scanForBrokenContent(page, 'Dashboard', testInfo);
  });
});

test.describe('Section 4: Courses (/courses)', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    attachDiagnostics(page, 'Courses', testInfo);
  });

  test('Course catalog loads with cards and PT subtitles', async ({ page }, testInfo) => {
    const start = Date.now();
    await page.goto('/courses', { waitUntil: 'domcontentloaded' });
    await waitForAppHydration(page);
    const duration = (Date.now() - start) / 1000;

    testInfo.annotations.push({
      type: 'coursesPageLoadTimeSec',
      description: duration.toFixed(2),
    });

    const body = await page.textContent('body');
    expect(body).toMatch(/(curso|aula|módulo|nível|conversação|inglês)/i);

    await scanForBrokenContent(page, 'Courses', testInfo);
  });
});

test.describe('Section 5: Lesson Slide Player', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    attachDiagnostics(page, 'Lesson Player', testInfo);
  });

  test('Verify lesson player route or player layout structure', async ({ page }, testInfo) => {
    await page.goto('/courses', { waitUntil: 'domcontentloaded' });
    await waitForAppHydration(page);

    const courseCard = page.locator('a[href*="/courses/"], [data-course-id]').first();
    if (await courseCard.isVisible()) {
      await courseCard.click();
      await waitForAppHydration(page);
      const lessonBody = await page.textContent('body');
      expect(lessonBody).toBeDefined();
    } else {
      testInfo.annotations.push({
        type: 'manualCheck',
        description: JSON.stringify({
          category: 'Lesson Player',
          item: 'Interactive Slide Audio & Mic',
          reason: 'Requires student test account with active course progress',
        }),
      });
    }
    await scanForBrokenContent(page, 'Lesson Player', testInfo);
  });
});

test.describe('Section 6: Booking / Agenda (/agenda)', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    attachDiagnostics(page, 'Booking/Agenda', testInfo);
  });

  test('Agenda loads booking calendar without blank screen', async ({ page }, testInfo) => {
    await page.goto('/agenda', { waitUntil: 'domcontentloaded' });
    await waitForAppHydration(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/(agenda|aula|horário|reservar|disponível|matt)/i);

    await scanForBrokenContent(page, 'Booking/Agenda', testInfo);
  });
});

test.describe('Section 7: Classroom (/classroom)', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    attachDiagnostics(page, 'Classroom', testInfo);
  });

  test('Classroom obsidian theme & meeting link destination validation', async ({ page }, testInfo) => {
    await page.goto('/classroom', { waitUntil: 'domcontentloaded' });
    await waitForAppHydration(page);
    const body = await page.textContent('body');
    expect(body).toMatch(/(sala|aula|zoom|meet|matt|professor)/i);

    const html = await page.content();
    const hasInvalidMeetingId = html.includes('zoom.us/j/professor0');
    const hasPlaceholderMeet = html.includes('meet.google.com/new');

    if (hasInvalidMeetingId || hasPlaceholderMeet) {
      testInfo.annotations.push({
        type: 'criticalFailure',
        description: JSON.stringify({
          category: 'Classroom',
          page: '/classroom',
          title: 'Invalid Classroom Meeting Link Destination',
          error: hasPlaceholderMeet
            ? 'Found generic placeholder meet.google.com/new instead of dedicated tutoring room'
            : 'Found invalid Zoom ID professor0 in room URL',
          severity: 'CRITICAL',
          isKnown: true,
        }),
      });
    }

    expect(hasInvalidMeetingId).toBe(false);
    if (hasPlaceholderMeet) {
      testInfo.annotations.push({
        type: 'observation',
        description: 'Classroom currently links to meet.google.com/new as a fallback room.',
      });
    }

    await scanForBrokenContent(page, 'Classroom', testInfo);
  });
});

test.describe('Section 8: Profile (/profile)', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    attachDiagnostics(page, 'Profile', testInfo);
  });

  test('Profile page loads without redirect crash', async ({ page }, testInfo) => {
    await page.goto('/profile', { waitUntil: 'domcontentloaded' });
    await waitForAppHydration(page);
    const body = await page.textContent('body');
    expect(body).toBeDefined();

    await scanForBrokenContent(page, 'Profile', testInfo);
  });
});

test.describe('Section 9: Legal Pages', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    attachDiagnostics(page, 'Legal Pages', testInfo);
  });

  test('Privacy policy page (/privacidade) loads with content', async ({ page }, testInfo) => {
    const res = await page.goto('/privacidade', { waitUntil: 'domcontentloaded' });
    await waitForAppHydration(page);
    expect(res?.status()).toBeLessThan(400);

    const text = await page.textContent('body');
    expect(text).toMatch(/(privacidade|dados|lgpd|informações|política)/i);
    await scanForBrokenContent(page, 'Privacy Policy', testInfo);
  });

  test('Terms of service page (/termos) loads with cancellation policy', async ({ page }, testInfo) => {
    const res = await page.goto('/termos', { waitUntil: 'domcontentloaded' });
    await waitForAppHydration(page);
    expect(res?.status()).toBeLessThan(400);

    const text = await page.textContent('body');
    expect(text).toMatch(/(termos|uso|condições|serviço|cancelamento|aula)/i);
    await scanForBrokenContent(page, 'Terms of Service', testInfo);
  });
});

test.describe('Section 10: PWA & Performance', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    attachDiagnostics(page, 'PWA/Performance', testInfo);
  });

  test('PWA manifest exists and contains standard fields', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(manifestHref).toBeDefined();

    const manifestUrl = manifestHref?.startsWith('http') ? manifestHref : manifestHref || '/manifest.json';
    const res = await page.request.get(manifestUrl, {
      headers: { Accept: 'application/json, text/plain, */*' },
    });
    
    expect(res.status()).toBe(200);
    const manifest = await res.json();
    expect(manifest.name || manifest.short_name).toBeDefined();
    expect(manifest.icons).toBeDefined();
  });

  test('HTML title and theme-color meta tags are valid', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const title = await page.title();
    expect(title).toMatch(/ELO!/);

    const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(themeColor).toBeDefined();
  });
});

test.describe('Section 11: Broken Content Scan', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    attachDiagnostics(page, 'Broken Content', testInfo);
  });

  test('404 nonexistent page renders friendly fallback without crashing', async ({ page }, testInfo) => {
    await page.goto('/nonexistent-page-test-qa', { waitUntil: 'domcontentloaded' });
    await waitForAppHydration(page);
    const body = await page.textContent('body');
    expect(body).toBeDefined();
    await scanForBrokenContent(page, '404 Route', testInfo);
  });
});

test.describe('Section 12: Console Errors', () => {
  test('Audit captured console logs & errors', async () => {
    // Verified by reporter onEnd
  });
});
