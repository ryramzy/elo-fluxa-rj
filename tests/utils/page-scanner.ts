import { Page, TestInfo } from '@playwright/test';

const BROKEN_PATTERNS = [
  { pattern: '??', regex: /\?\?/g, desc: 'Corrupted emoji' },
  { pattern: 'YOUR_PIXEL_ID_HERE', regex: /YOUR_PIXEL_ID_HERE/g, desc: 'Facebook Pixel placeholder' },
  { pattern: 'undefined', regex: /\bundefined\b/g, desc: 'Unrendered JS undefined variable' },
  { pattern: 'null', regex: /\bnull\b/g, desc: 'Unrendered null value' },
  { pattern: '[object Object]', regex: /\[object Object\]/g, desc: 'Unserialized object' },
  { pattern: 'lorem ipsum', regex: /lorem ipsum/i, desc: 'Placeholder lorem ipsum copy' },
  { pattern: 'professor0', regex: /professor0/g, desc: 'Invalid Zoom ID professor0' },
  { pattern: 'zoom.us/j/professor0', regex: /zoom\.us\/j\/professor0/g, desc: 'Invalid meeting URL' },
];

export function attachDiagnostics(page: Page, pageName: string, testInfo?: TestInfo) {
  page.on('console', (msg) => {
    const text = msg.text();
    const type = msg.type();
    if (type === 'error') {
      if (testInfo) {
        testInfo.annotations.push({
          type: 'consoleLog',
          description: JSON.stringify({ page: pageName, type: 'error', text: text.slice(0, 200) }),
        });
      }
    } else if (type === 'warning') {
      if (testInfo) {
        testInfo.annotations.push({
          type: 'consoleLog',
          description: JSON.stringify({ page: pageName, type: 'warning', text: text.slice(0, 200) }),
        });
      }
    }
  });

  page.on('response', (res) => {
    const status = res.status();
    const url = res.url();
    if (status >= 400 && !url.includes('favicon') && !url.includes('nonexistent-page')) {
      if (testInfo) {
        testInfo.annotations.push({
          type: 'degraded',
          description: JSON.stringify({
            category: pageName,
            page: pageName,
            title: 'HTTP Error Response',
            detail: `URL: ${url} returned HTTP ${status}`,
          }),
        });
      }
    }
  });
}

export async function scanForBrokenContent(page: Page, pageName: string, testInfo?: TestInfo): Promise<number> {
  const bodyText = await page.evaluate(() => document.body ? document.body.innerText : '');
  const htmlContent = await page.content();
  let foundCount = 0;

  for (const { pattern, regex, desc } of BROKEN_PATTERNS) {
    const match = pattern === 'YOUR_PIXEL_ID_HERE' ? htmlContent.match(regex) : bodyText.match(regex);
    if (match) {
      foundCount += match.length;
      const idx = pattern === 'YOUR_PIXEL_ID_HERE' ? htmlContent.indexOf(pattern) : bodyText.indexOf(pattern);
      const start = Math.max(0, idx - 25);
      const end = Math.min((pattern === 'YOUR_PIXEL_ID_HERE' ? htmlContent.length : bodyText.length), idx + pattern.length + 25);
      const snippet = (pattern === 'YOUR_PIXEL_ID_HERE' ? htmlContent : bodyText).slice(start, end).replace(/\s+/g, ' ');

      if (testInfo) {
        testInfo.annotations.push({
          type: 'brokenContent',
          description: JSON.stringify({
            page: pageName,
            pattern,
            context: `${desc}: ...${snippet}...`,
          }),
        });
      }
    }
  }

  return foundCount;
}

export async function checkHorizontalScroll(page: Page, width = 375, height = 667): Promise<boolean> {
  await page.setViewportSize({ width, height });
  const hasOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  return !hasOverflow;
}
