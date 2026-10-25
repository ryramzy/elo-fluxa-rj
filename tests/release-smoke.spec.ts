import { test, expect } from '@playwright/test';

test.use({ ignoreHTTPSErrors: false });

// Exchange the secret for a deployment cookie before opening a browser page.
// Do not follow redirects with a credential header or add it to browser traffic.
test.beforeEach(async ({ context, baseURL }) => {
  const secret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  if (!secret || !baseURL) return;
  await context.request.get(new URL('/', baseURL).href, {
    headers: {
      'x-vercel-protection-bypass': secret,
      'x-vercel-set-bypass-cookie': 'true',
    },
    maxRedirects: 0,
    timeout: 15000,
  });
});

test('Deployed app renders core routes without startup failures', async ({ page }) => {
  const runtimeErrors: string[] = [];
  const configurationErrors: string[] = [];
  page.on('pageerror', error => runtimeErrors.push(error.message));
  page.on('console', message => {
    if (/Missing Firebase environment variables|App will run in demo mode/i.test(message.text())) {
      configurationErrors.push(message.text());
    }
  });
  for (const route of ['/', '/login', '/courses', '/dicas', '/privacidade', '/termos']) {
    const response = await page.goto(route);
    expect(response?.status(), `${route} must return HTTP 200`).toBe(200);
    await expect(page.locator('#root')).toContainText(/ELO|inglês|conta|privacidade|termos/i);
    await expect(page.locator('a[href*="wa.me/"]').first()).toBeVisible();
    await expect(page.getByText('Algo deu errado', { exact: false })).toHaveCount(0);
  }
  expect(runtimeErrors).toEqual([]);
  if (process.env.REQUIRE_FIREBASE) expect(configurationErrors).toEqual([]);
});

test('Auth gateway is healthy on the deployment', async ({ request }) => {
  test.skip(!process.env.REQUIRE_FIREBASE, 'Requires deployed serverless functions.');
  const secret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  const response = await request.get('/api/health', {
    maxRedirects: 0,
    timeout: 15000,
    headers: secret ? { 'x-vercel-protection-bypass': secret } : undefined,
  });
  expect(response.status()).toBe(200);
  expect((await response.json()).status).toBe('healthy');
});
