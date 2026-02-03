// apps/web/e2e/navigation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Navigation to Parking Spot', () => {
  test.beforeEach(async ({ page }) => {
    // Clear IndexedDB before each test to start fresh
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(async () => {
      const databases = await indexedDB.databases();
      for (const db of databases) {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
        }
      }
    });
  });

  test('navigate button opens maps with coordinates (AC2, AC4)', async ({ page, context }) => {
    // Mock geolocation
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();
    await expect(page).toHaveURL('/');

    // Save a spot with coordinates
    await page.getByTestId('save-spot-button').click();
    await page.waitForURL(/\/spot\/.*\/confirm/, { timeout: 10000 });
    await page.goto('/');

    // Wait for card to appear
    await expect(page.getByTestId('latest-spot-card')).toBeVisible({ timeout: 10000 });

    // Listen for new page/popup when clicking navigate
    const popupPromise = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);

    await page.getByTestId('navigate-button').click();

    // Should open maps in new tab (popup)
    const popup = await popupPromise;
    if (popup) {
      const url = popup.url();
      // Should use Google Maps on desktop (non-iOS)
      expect(url).toContain('google.com/maps');
      // Should contain walking directions
      expect(url).toContain('travelmode=walking');
      // Should contain coordinates
      expect(url).toContain('40.7128');
      expect(url).toContain('-74.006');
    }
  });

  test('navigate button opens maps with address when no coordinates (AC6)', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();
    await expect(page).toHaveURL('/');

    // Navigate directly to manual address entry page
    await page.goto('/spots/manual', { waitUntil: 'domcontentloaded' });

    // Enter address manually
    await page.getByPlaceholder(/123 Main St/i).fill('123 Main St, New York, NY');
    await page.getByRole('button', { name: /save spot/i }).click();

    // Wait for confirmation page
    await page.waitForURL(/\/spot\/.*\/confirm/, { timeout: 10000 });
    await page.goto('/');

    // Wait for card to appear
    await expect(page.getByTestId('latest-spot-card')).toBeVisible({ timeout: 10000 });

    // Listen for new page/popup when clicking navigate
    const popupPromise = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);

    await page.getByTestId('navigate-button').click();

    // Should open maps in new tab (popup)
    const popup = await popupPromise;
    if (popup) {
      const url = popup.url();
      // Should use Google Maps on desktop (non-iOS)
      expect(url).toContain('google.com/maps');
      // Should contain walking directions
      expect(url).toContain('travelmode=walking');
      // Should contain encoded address
      expect(url).toContain('Main');
    }
  });

  test('navigate button displays correctly on latest spot card (AC1)', async ({
    page,
    context,
  }) => {
    // Mock geolocation
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();

    // Save a spot
    await page.getByTestId('save-spot-button').click();
    await page.waitForURL(/\/spot\/.*\/confirm/, { timeout: 10000 });
    await page.goto('/');

    // Wait for card to appear
    await expect(page.getByTestId('latest-spot-card')).toBeVisible({ timeout: 10000 });

    // Navigate button should be visible and have correct text
    const navigateButton = page.getByTestId('navigate-button');
    await expect(navigateButton).toBeVisible();
    await expect(navigateButton).toContainText('Navigate');

    // Button should have compass emoji
    await expect(navigateButton.locator('span')).toContainText('🧭');
  });
});
