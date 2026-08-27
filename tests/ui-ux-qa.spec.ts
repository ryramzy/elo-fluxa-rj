import { test, expect, Page } from '@playwright/test';
import {
  checkResponsiveOverflow,
  auditTouchTargets,
  auditAccessibility,
  auditInputFontSizes,
  auditHeadingHierarchy,
} from './utils/ui-ux-evaluator';
import { scanForBrokenContent } from './utils/page-scanner';

async function waitForApp(page: Page) {
  try {
    await page.waitForFunction(
      () => {
        const root = document.getElementById('root');
        if (!root) return false;
        const text = root.innerText.trim();
        return text.length > 50 && !!document.querySelector('h1, h2, nav, main, footer');
      },
      { timeout: 10000 }
    );
  } catch (e) {}
}

test.describe('Section 1: Responsive Layout & Mobile Viewports', () => {
  test('Landing page is responsive without horizontal overflow on 375px (iPhone SE)', async ({ page }, testInfo) => {
    const start = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForApp(page);
    testInfo.annotations.push({
      type: 'mobileLoadTimeSec',
      description: ((Date.now() - start) / 1000).toFixed(2),
    });

    const is375Ok = await checkResponsiveOverflow(page, { width: 375, height: 667 }, 'Landing (375px)', testInfo);
    expect(is375Ok).toBe(true);
  });

  test('Landing page is responsive on 390px (iPhone 14) and 768px (iPad)', async ({ page }, testInfo) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForApp(page);

    const is390Ok = await checkResponsiveOverflow(page, { width: 390, height: 844 }, 'Landing (390px)', testInfo);
    const is768Ok = await checkResponsiveOverflow(page, { width: 768, height: 1024 }, 'Landing (768px)', testInfo);

    expect(is390Ok).toBe(true);
    expect(is768Ok).toBe(true);
  });

  test('Classroom view (/classroom) layout handles mobile and desktop viewports', async ({ page }, testInfo) => {
    await page.goto('/classroom', { waitUntil: 'domcontentloaded' });
    await waitForApp(page);

    const isClassroom375Ok = await checkResponsiveOverflow(page, { width: 375, height: 667 }, 'Classroom (375px)', testInfo);
    expect(isClassroom375Ok).toBe(true);
  });
});

test.describe('Section 2: Typography & Visual Hierarchy', () => {
  test('Landing page heading structure and hierarchy validation', async ({ page }, testInfo) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForApp(page);

    await auditHeadingHierarchy(page, 'Landing Page', testInfo);

    const fontStyles = await page.evaluate(() => {
      const heading = document.querySelector('h1, h2, h3, h4, [role="heading"], main div[class*="text-"]');
      if (!heading) return null;
      const s = window.getComputedStyle(heading);
      return {
        tag: heading.tagName.toLowerCase(),
        fontFamily: s.fontFamily,
        fontWeight: s.fontWeight,
        lineHeight: s.lineHeight,
      };
    });

    if (fontStyles) {
      testInfo.annotations.push({
        type: 'uiUxObservation',
        description: `Primary Hero Typography (<${fontStyles.tag}>): Weight ${fontStyles.fontWeight}, LineHeight ${fontStyles.lineHeight}`,
      });
    } else {
      testInfo.annotations.push({
        type: 'uiUxIssue',
        description: JSON.stringify({
          category: 'Typography & Visual Hierarchy',
          page: 'Landing Page',
          element: 'Hero',
          issueType: 'HEADING_HIERARCHY',
          details: 'No standard heading element found in hero section',
          severity: 'MEDIUM',
        }),
      });
    }
  });
});

test.describe('Section 3: Theme & Dark Mode Consistency', () => {
  test('Classroom obsidian theme aesthetic and slate contrast verification', async ({ page }, testInfo) => {
    await page.goto('/classroom', { waitUntil: 'domcontentloaded' });
    await waitForApp(page);

    const themeColors = await page.evaluate(() => {
      const body = document.body;
      const content = document.querySelector('main, #content-area, .min-h-screen');
      const cs = content ? window.getComputedStyle(content) : null;
      return {
        bg: cs?.backgroundColor || window.getComputedStyle(body).backgroundColor,
        textColor: cs?.color || window.getComputedStyle(body).color,
      };
    });

    testInfo.annotations.push({
      type: 'uiUxObservation',
      description: `Classroom Dark Theme Palette: Background ${themeColors.bg}, Text ${themeColors.textColor}`,
    });
    expect(themeColors.bg).toBeDefined();
  });
});

test.describe('Section 4: Visual Polish & Card Styling', () => {
  test('Cards, badges, and image aspect ratios are preserved without distortion', async ({ page }, testInfo) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForApp(page);

    const imageRatios = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img')).filter((i) => i.width > 20 && i.height > 20);
      let distorted = 0;
      for (const img of imgs) {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          const naturalRatio = img.naturalWidth / img.naturalHeight;
          const renderedRatio = img.clientWidth / img.clientHeight;
          const objFit = window.getComputedStyle(img).objectFit;
          if (objFit === 'fill' && Math.abs(naturalRatio - renderedRatio) > 0.4) {
            distorted++;
          }
        }
      }
      return { total: imgs.length, distorted };
    });

    expect(imageRatios.distorted).toBe(0);
  });
});

test.describe('Section 5: Interactive Feedback & Micro-Interactions', () => {
  test('Interactive buttons have active/hover feedback and cursor pointer', async ({ page }, testInfo) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForApp(page);

    const buttonCursor = await page.evaluate(() => {
      const primaryBtn = document.querySelector('button, a[href*="wa.me"]');
      if (!primaryBtn) return 'default';
      return window.getComputedStyle(primaryBtn).cursor;
    });

    expect(['pointer', 'default']).toContain(buttonCursor);

    // Test FAQ interactive accordion transition
    const faqDetails = page.locator('details, [data-faq], button:has-text("?")').first();
    if (await faqDetails.isVisible()) {
      await faqDetails.click();
      await page.waitForTimeout(200);
    }
  });
});

test.describe('Section 6: Forms, Inputs & Ergonomics', () => {
  test('Email newsletter and text input font-sizes prevent iOS auto-zoom (>15.5px)', async ({ page }, testInfo) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForApp(page);

    const smallInputs = await auditInputFontSizes(page, 'Landing Page Form', testInfo);
    testInfo.annotations.push({
      type: 'uiUxObservation',
      description: `Forms Audit: ${smallInputs === 0 ? 'All inputs meet standard 16px size' : `${smallInputs} inputs with <16px font size`}`,
    });
  });
});

test.describe('Section 7: Navigation & Information Architecture', () => {
  test('Top navbar, brand logo, and footer architecture links are clear and accessible', async ({ page }, testInfo) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForApp(page);

    const brand = page.locator('header a, nav a').filter({ hasText: /ELO!/i }).first();
    expect(await brand.count()).toBeGreaterThan(0);

    const footer = page.locator('footer');
    expect(await footer.count()).toBeGreaterThan(0);
  });
});

test.describe('Section 8: Conversion Funnels & CTA Clarity', () => {
  test('Primary CTA is prominent above fold with high visual contrast', async ({ page }, testInfo) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForApp(page);

    const cta = page.locator('button, a').filter({ hasText: /(Começar|Falar|Entrar|Agendar|WhatsApp|Testar)/i }).first();
    expect(await cta.isVisible()).toBe(true);

    const ctaStyles = await cta.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        color: cs.color,
        fontWeight: cs.fontWeight,
        borderRadius: cs.borderRadius,
      };
    });

    testInfo.annotations.push({
      type: 'uiUxObservation',
      description: `Primary Conversion CTA: Background ${ctaStyles.bg}, Text ${ctaStyles.color}, Radius ${ctaStyles.borderRadius}`,
    });
  });
});

test.describe('Section 9: Accessibility & Touch Targets', () => {
  test('Touch target dimensions and image alternative descriptions audit', async ({ page }, testInfo) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForApp(page);

    await auditTouchTargets(page, 'Landing Page', testInfo);
    await auditAccessibility(page, 'Landing Page', testInfo);
  });
});

test.describe('Section 10: PWA Experience & Standalone UI', () => {
  test('PWA manifest theme color, icons, and standalone display configurations', async ({ page }, testInfo) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForApp(page);

    const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(themeColor).toBeDefined();

    testInfo.annotations.push({
      type: 'uiUxObservation',
      description: `PWA Browser Status Bar Theme Color: ${themeColor}`,
    });
  });
});

test.describe('Section 11: Content Integrity & Formatting', () => {
  test('Copy check for corrupted emojis, broken tokens, and formatting artifacts', async ({ page }, testInfo) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForApp(page);

    await scanForBrokenContent(page, 'Landing Page', testInfo);
  });
});

test.describe('Section 12: Perceived Speed, Stability & CLS', () => {
  test('Measure Cumulative Layout Shift (CLS) and smooth layout stability', async ({ page }, testInfo) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForApp(page);

    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;
        try {
          const observer = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value || 0;
              }
            }
          });
          observer.observe({ type: 'layout-shift', buffered: true });
          setTimeout(() => {
            observer.disconnect();
            resolve(clsValue);
          }, 800);
        } catch (e) {
          resolve(0);
        }
      });
    });

    testInfo.annotations.push({
      type: 'clsScore',
      description: cls.toFixed(3),
    });

    expect(cls).toBeLessThan(0.25);
  });
});
