// Tests for 404.html URL routing logic.
// Verifies that clean URLs redirect to the correct slices.
const { test, expect } = require('@playwright/test');

// Stub any API calls so pages don't error while we check URL redirection.
const stubApi = route => route.fulfill({ status: 200, json: {} });

test.describe('404.html routing', () => {
  test('/r/{token} → booking-status with ?token=', async ({ page }) => {
    await page.route('**/api/rms/**', stubApi);
    await page.goto('/r/tok-abc123');
    await expect(page).toHaveURL(/\/slices\/borrower\/booking-status\/\?token=tok-abc123/);
  });

  test('/r/{token} preserves additional query params', async ({ page }) => {
    await page.route('**/api/rms/**', stubApi);
    await page.goto('/r/tok-abc123?id=booking-456');
    await expect(page).toHaveURL(/token=tok-abc123/);
    await expect(page).toHaveURL(/id=booking-456/);
  });

  test('/{slug}/admin → owner dashboard', async ({ page }) => {
    await page.route('**/api/rms/**', stubApi);
    await page.goto('/sarah-k/admin');
    await expect(page).toHaveURL(/\/slices\/owner\/dashboard\/\?slug=sarah-k/);
  });

  test('/{slug}?t={token} → borrower browse', async ({ page }) => {
    await page.route('**/api/rms/**', stubApi);
    await page.goto('/sarah-k?t=sharetoken');
    await expect(page).toHaveURL(/\/slices\/borrower\/browse\/\?slug=sarah-k/);
    await expect(page).toHaveURL(/t=sharetoken/);
  });

  test('/{slug} → owner landing', async ({ page }) => {
    await page.route('**/api/rms/**', stubApi);
    await page.goto('/sarah-k');
    await expect(page).toHaveURL(/\/slices\/owner\/landing\/\?slug=sarah-k/);
  });
});
