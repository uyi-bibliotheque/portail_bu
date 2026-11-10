import { test, expect } from '@playwright/test';

const consentBanner = (page) => page.getByRole('button', { name: 'Accepter tout' });

test('keeps an accepted cookie choice after reload', async ({ page }) => {
  await page.goto('/connexion');

  await expect(consentBanner(page)).toBeVisible({ timeout: 5000 });
  await consentBanner(page).click();
  await expect(consentBanner(page)).toBeHidden();

  await page.reload();
  await expect(consentBanner(page)).toBeHidden({ timeout: 3000 });
  await expect.poll(() => page.evaluate(() => localStorage.getItem('cookieConsent')))
    .toBe('true');
});

test('does not show the banner again after the user refuses', async ({ page }) => {
  await page.goto('/connexion');

  await expect(consentBanner(page)).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'Fermer' }).click();
  await expect(consentBanner(page)).toBeHidden();

  await page.reload();
  await expect(consentBanner(page)).toBeHidden({ timeout: 3000 });
  await expect.poll(() => page.evaluate(() => localStorage.getItem('cookieConsent')))
    .toBe('false');
});

test('asks for a fresh choice after one year', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cookieConsent', 'true');
    localStorage.setItem('cookiePreferences', JSON.stringify({
      necessary: true,
      preferences: true,
      statistics: true,
      marketing: true,
    }));
    localStorage.setItem(
      'cookieConsentUpdatedAt',
      String(Date.now() - 366 * 24 * 60 * 60 * 1000),
    );
  });

  await page.goto('/connexion');
  await expect(consentBanner(page)).toBeVisible({ timeout: 5000 });
  await expect.poll(() => page.evaluate(() => localStorage.getItem('cookiePreferences')))
    .toContain('"statistics":false');
});

test('keeps the cookie choice when an expired login session is cleared', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cookieConsent', 'true');
    localStorage.setItem('cookiePreferences', JSON.stringify({
      necessary: true,
      preferences: false,
      statistics: false,
      marketing: false,
    }));
    localStorage.setItem('cookieConsentUpdatedAt', String(Date.now()));
    localStorage.setItem('access_token', 'expired-access-token');
    localStorage.setItem('refresh_token', 'expired-refresh-token');
  });
  await page.route('**/api/auth/me/', route => route.fulfill({
    status: 401,
    contentType: 'application/json',
    body: '{}',
  }));
  await page.route('**/api/token/refresh/', route => route.fulfill({
    status: 401,
    contentType: 'application/json',
    body: '{}',
  }));

  await page.goto('/connexion');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('cookieConsent')))
    .toBe('true');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('refresh_token')))
    .toBeNull();
  await page.reload();
  await expect(consentBanner(page)).toBeHidden({ timeout: 3000 });
});
