import { test, expect } from '@playwright/test';

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
  const response = await request.get('/api/health');
  expect(response.status()).toBe(200);
  expect((await response.json()).status).toBe('healthy');
});
