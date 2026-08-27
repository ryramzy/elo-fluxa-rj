import { Page, TestInfo } from '@playwright/test';

export interface UiUxIssue {
  category: string;
  page: string;
  element: string;
  issueType: 'LAYOUT_OVERFLOW' | 'TOUCH_TARGET_TOO_SMALL' | 'CONTRAST_LOW' | 'MISSING_ALT' | 'MISSING_ARIA' | 'INPUT_FONT_TOO_SMALL' | 'BROKEN_ASPECT_RATIO' | 'HEADING_HIERARCHY';
  details: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export async function checkResponsiveOverflow(page: Page, viewport: { width: number; height: number }, pageName: string, testInfo?: TestInfo): Promise<boolean> {
  await page.setViewportSize(viewport);
  await page.waitForTimeout(400);

  const overflowDetails = await page.evaluate((vpWidth) => {
    const docWidth = document.documentElement.scrollWidth;
    const bodyWidth = document.body ? document.body.scrollWidth : 0;
    const maxScroll = Math.max(docWidth, bodyWidth);
    const isOverflowing = maxScroll > window.innerWidth + 2; // small tolerance for scrollbars

    let offendingElements: string[] = [];
    if (isOverflowing) {
      const all = Array.from(document.querySelectorAll('*'));
      for (const el of all) {
        const rect = el.getBoundingClientRect();
        if (rect.right > window.innerWidth + 5) {
          const tag = el.tagName.toLowerCase();
          const className = typeof el.className === 'string' ? el.className.slice(0, 50) : '';
          const id = el.id ? `#${el.id}` : '';
          offendingElements.push(`${tag}${id}.${className.replace(/\s+/g, '.')}`);
          if (offendingElements.length >= 3) break;
        }
      }
    }

    return {
      isOverflowing,
      maxScroll,
      vpWidth: window.innerWidth,
      offendingElements,
    };
  }, viewport.width);

  if (overflowDetails.isOverflowing && testInfo) {
    testInfo.annotations.push({
      type: 'uiUxIssue',
      description: JSON.stringify({
        category: 'Responsive Layout',
        page: pageName,
        element: overflowDetails.offendingElements.join(', ') || 'document.body',
        issueType: 'LAYOUT_OVERFLOW',
        details: `Viewport ${viewport.width}px overflows by ${overflowDetails.maxScroll - overflowDetails.vpWidth}px`,
        severity: 'HIGH',
      }),
    });
  }

  return !overflowDetails.isOverflowing;
}

export async function auditTouchTargets(page: Page, pageName: string, testInfo?: TestInfo): Promise<{ total: number; undersized: number }> {
  const result = await page.evaluate(() => {
    const clickables = Array.from(document.querySelectorAll('button, a, input[type="button"], input[type="submit"], [role="button"]'));
    let undersized = 0;
    const undersizedList: string[] = [];

    for (const el of clickables) {
      const rect = el.getBoundingClientRect();
      // Only check visible interactive elements
      if (rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).display !== 'none' && window.getComputedStyle(el).visibility !== 'hidden') {
        const isInlineTextLink = el.tagName.toLowerCase() === 'a' && el.parentElement?.tagName.toLowerCase() === 'p';
        // Primary buttons / stand-alone targets should be at least 40px
        if (!isInlineTextLink && (rect.width < 36 || rect.height < 36)) {
          undersized++;
          const text = (el.textContent || '').trim().slice(0, 25);
          undersizedList.push(`<${el.tagName.toLowerCase()}> "${text}" (${Math.round(rect.width)}x${Math.round(rect.height)}px)`);
          if (undersizedList.length >= 4) break;
        }
      }
    }

    return {
      total: clickables.length,
      undersized,
      undersizedList,
    };
  });

  if (result.undersized > 0 && testInfo) {
    testInfo.annotations.push({
      type: 'uiUxIssue',
      description: JSON.stringify({
        category: 'Interactive Ergonomics',
        page: pageName,
        element: result.undersizedList.join(', '),
        issueType: 'TOUCH_TARGET_TOO_SMALL',
        details: `Found ${result.undersized} touch targets smaller than 36x36px recommended mobile standard`,
        severity: 'MEDIUM',
      }),
    });
  }

  return result;
}

export async function auditAccessibility(page: Page, pageName: string, testInfo?: TestInfo): Promise<{ missingAlt: number; missingAria: number }> {
  const result = await page.evaluate(() => {
    // 1. Check images for alt attributes
    const imgs = Array.from(document.querySelectorAll('img'));
    let missingAlt = 0;
    const missingAltSrcs: string[] = [];
    for (const img of imgs) {
      if (!img.hasAttribute('alt') || img.getAttribute('alt') === '') {
        // Exclude tracking pixels or decorative images
        if (img.width > 10 && img.height > 10 && !img.src.includes('facebook.com/tr')) {
          missingAlt++;
          missingAltSrcs.push(img.src.slice(-30));
        }
      }
    }

    // 2. Check icon-only buttons for aria-label or title
    const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
    let missingAria = 0;
    const missingAriaList: string[] = [];
    for (const btn of buttons) {
      const text = (btn.textContent || '').trim();
      const hasAria = btn.hasAttribute('aria-label') || btn.hasAttribute('aria-labelledby') || btn.hasAttribute('title');
      const hasSvg = btn.querySelector('svg') !== null;
      if (text === '' && hasSvg && !hasAria) {
        missingAria++;
        missingAriaList.push(`<button> containing <svg>`);
      }
    }

    return {
      missingAlt,
      missingAltSrcs,
      missingAria,
      missingAriaList,
    };
  });

  if (result.missingAlt > 0 && testInfo) {
    testInfo.annotations.push({
      type: 'uiUxIssue',
      description: JSON.stringify({
        category: 'Accessibility',
        page: pageName,
        element: result.missingAltSrcs.join(', '),
        issueType: 'MISSING_ALT',
        details: `${result.missingAlt} visible image(s) missing alt text description`,
        severity: 'LOW',
      }),
    });
  }

  if (result.missingAria > 0 && testInfo) {
    testInfo.annotations.push({
      type: 'uiUxIssue',
      description: JSON.stringify({
        category: 'Accessibility',
        page: pageName,
        element: result.missingAriaList.join(', '),
        issueType: 'MISSING_ARIA',
        details: `${result.missingAria} icon-only button(s) without aria-label`,
        severity: 'MEDIUM',
      }),
    });
  }

  return { missingAlt: result.missingAlt, missingAria: result.missingAria };
}

export async function auditInputFontSizes(page: Page, pageName: string, testInfo?: TestInfo): Promise<number> {
  const result = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="password"], textarea, select'));
    let smallInputs = 0;
    const smallList: string[] = [];

    for (const inp of inputs) {
      const style = window.getComputedStyle(inp);
      const fontSize = parseFloat(style.fontSize);
      // On iOS Safari, inputs with font-size < 16px cause automatic zoom on focus, degrading UX
      if (fontSize < 15.5) {
        smallInputs++;
        smallList.push(`${inp.getAttribute('placeholder') || inp.tagName} (${fontSize}px)`);
      }
    }

    return { smallInputs, smallList };
  });

  if (result.smallInputs > 0 && testInfo) {
    testInfo.annotations.push({
      type: 'uiUxIssue',
      description: JSON.stringify({
        category: 'Forms & Inputs',
        page: pageName,
        element: result.smallList.join(', '),
        issueType: 'INPUT_FONT_TOO_SMALL',
        details: `${result.smallInputs} input(s) have font-size < 16px (triggers unwanted iOS zoom)`,
        severity: 'LOW',
      }),
    });
  }

  return result.smallInputs;
}

export async function auditHeadingHierarchy(page: Page, pageName: string, testInfo?: TestInfo): Promise<boolean> {
  const result = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const levels = headings.map((h) => parseInt(h.tagName.substring(1), 10));
    let hasSkippedLevel = false;

    for (let i = 0; i < levels.length - 1; i++) {
      if (levels[i + 1] > levels[i] + 1) {
        hasSkippedLevel = true;
        break;
      }
    }

    return {
      h1Count: levels.filter((l) => l === 1).length,
      levels,
      hasSkippedLevel,
    };
  });

  if (result.h1Count === 0 && testInfo) {
    testInfo.annotations.push({
      type: 'uiUxIssue',
      description: JSON.stringify({
        category: 'Typography & Hierarchy',
        page: pageName,
        element: 'document',
        issueType: 'HEADING_HIERARCHY',
        details: 'Page missing top-level <h1> heading',
        severity: 'MEDIUM',
      }),
    });
  }

  return !result.hasSkippedLevel;
}
