import { test, expect } from '@playwright/test';
import { getWhatsAppLink, getPixReceiptWhatsAppLink, WHATSAPP_MESSAGES } from '../constants';

test('All contact messages and Pix receipts use the new number with one encoded message', () => {
  const links = Object.keys(WHATSAPP_MESSAGES).map(context =>
    getWhatsAppLink(context as keyof typeof WHATSAPP_MESSAGES, {
      studentName: 'João & Ana', date: '2026-10-26', time: '10:00',
    }));
  links.push(getPixReceiptWhatsAppLink('João & Ana', 'biweekly', 700));
  for (const link of links) {
    const url = new URL(link);
    expect(url.origin).toBe('https://wa.me');
    expect(url.pathname).toBe('/5521992094338');
    expect(url.searchParams.getAll('text')).toHaveLength(1);
    expect(url.searchParams.get('text')).toContain('João & Ana');
  }
});

test('Public contact anchors include a single prefilled message', async ({ page }) => {
  for (const route of ['/', '/dicas', '/sobre']) {
    await page.goto(route);
    const links = page.locator('a[href*="wa.me/"]');
    await expect(links.first()).toBeVisible();
    for (const href of await links.evaluateAll(nodes => nodes.map(node => (node as HTMLAnchorElement).href))) {
      const url = new URL(href);
      expect(url.pathname).toBe('/5521992094338');
      expect(url.searchParams.getAll('text')).toHaveLength(1);
      expect(url.searchParams.get('text')).toBeTruthy();
    }
  }
});

test('WhatsApp embedded browser gets login guidance and working email fields', async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: process.env.BASE_URL || 'https://www.eloingles.com.br',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36 WhatsApp/2.24',
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('/login');
  await expect(page.getByRole('note')).toContainText('Chrome ou Safari');
  await expect(page.getByPlaceholder('seu-email@exemplo.com', { exact: true })).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
  await context.close();
});
