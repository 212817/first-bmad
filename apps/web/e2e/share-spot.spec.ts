// apps/web/e2e/share-spot.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Share Spot Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Clear IndexedDB before each test
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

  test.describe('Guest Mode', () => {
    test('share button should be disabled for guest users (AC: Guest mode restriction)', async ({
      page,
      context,
    }) => {
      // Grant geolocation permission
      await context.grantPermissions(['geolocation']);
      await context.setGeolocation({ latitude: 48.9102, longitude: 24.7085, accuracy: 15 });

      // Enter guest mode
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.getByRole('button', { name: /continue as guest/i }).click();

      // Save a spot
      await page.getByTestId('save-spot-button').click();
      await expect(page).toHaveURL(/\/spot\/.*\/confirm/, { timeout: 15000 });

      // Navigate to spot detail page
      await page.goto('/history', { waitUntil: 'domcontentloaded' });
      await page.getByTestId('history-spot-item').first().click();
      await expect(page).toHaveURL(/\/spot\/[^/]+$/);

      // Share button should be visible but disabled
      const shareButton = page.getByTestId('share-button');
      await expect(shareButton).toBeVisible();
      await expect(shareButton).toBeDisabled();
    });

    test('share button should show sign-in tooltip for guests', async ({ page, context }) => {
      // Grant geolocation permission
      await context.grantPermissions(['geolocation']);
      await context.setGeolocation({ latitude: 48.9102, longitude: 24.7085, accuracy: 15 });

      // Enter guest mode
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.getByRole('button', { name: /continue as guest/i }).click();

      // Save a spot
      await page.getByTestId('save-spot-button').click();
      await expect(page).toHaveURL(/\/spot\/.*\/confirm/, { timeout: 15000 });

      // Navigate to spot detail page
      await page.goto('/history', { waitUntil: 'domcontentloaded' });
      await page.getByTestId('history-spot-item').first().click();

      // Share button should have sign-in tooltip
      const shareButton = page.getByTestId('share-button');
      await expect(shareButton).toHaveAttribute('title', 'Sign in to share spots');
    });
  });

  test.describe('Share Button UI', () => {
    test('share button should be visible on spot detail page', async ({ page, context }) => {
      // Grant geolocation permission
      await context.grantPermissions(['geolocation']);
      await context.setGeolocation({ latitude: 48.9102, longitude: 24.7085, accuracy: 15 });

      // Enter guest mode (sufficient for UI visibility test)
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.getByRole('button', { name: /continue as guest/i }).click();

      // Save a spot
      await page.getByTestId('save-spot-button').click();
      await expect(page).toHaveURL(/\/spot\/.*\/confirm/, { timeout: 15000 });

      // Navigate to spot detail page
      await page.goto('/history', { waitUntil: 'domcontentloaded' });
      await page.getByTestId('history-spot-item').first().click();
      await expect(page).toHaveURL(/\/spot\/[^/]+$/);

      // Share button should be visible
      const shareButton = page.getByTestId('share-button');
      await expect(shareButton).toBeVisible();
    });

    test('share button should NOT be visible on confirmation page for guests', async ({
      page,
      context,
    }) => {
      // Grant geolocation permission
      await context.grantPermissions(['geolocation']);
      await context.setGeolocation({ latitude: 48.9102, longitude: 24.7085, accuracy: 15 });

      // Enter guest mode
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.getByRole('button', { name: /continue as guest/i }).click();

      // Save a spot
      await page.getByTestId('save-spot-button').click();
      await expect(page).toHaveURL(/\/spot\/.*\/confirm/, { timeout: 15000 });

      // Share button should NOT be visible for guests (requires authentication)
      const shareButton = page.getByTestId('share-button');
      await expect(shareButton).not.toBeVisible();
    });
  });
});
