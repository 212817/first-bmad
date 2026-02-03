// apps/web/e2e/spot-history.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Spot History', () => {
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

  test('should show history link in header', async ({ page }) => {
    // Enter guest mode first
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();
    await expect(page).toHaveURL('/');

    const historyLink = page.getByTestId('history-link');
    await expect(historyLink).toBeVisible();
  });

  test('should navigate to history page when clicking history link', async ({ page }) => {
    // Enter guest mode first
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();
    await expect(page).toHaveURL('/');

    await page.getByTestId('history-link').click();

    await expect(page).toHaveURL('/history');
  });

  test('should display "Spot History" title on history page', async ({ page }) => {
    // Enter guest mode first
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();
    await expect(page).toHaveURL('/');

    await page.goto('/history', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Spot History' })).toBeVisible();
  });

  test('should show empty state when no spots exist (AC8)', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();
    await expect(page).toHaveURL('/');

    await page.goto('/history', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('empty-spot-state')).toBeVisible();
  });

  test('should navigate back to home when clicking back button', async ({ page }) => {
    // Enter guest mode first
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();
    await expect(page).toHaveURL('/');

    await page.goto('/history', { waitUntil: 'domcontentloaded' });

    await page.getByLabel('Go back').click();

    await expect(page).toHaveURL('/');
  });

  test('guest mode: should display spots after saving (AC7)', async ({ page, context }) => {
    // Grant geolocation permission
    await context.grantPermissions(['geolocation']);

    // Set mock geolocation
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

    // Enter guest mode
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();

    // Save a spot
    await page.getByTestId('save-spot-button').click();

    // Wait for confirmation page
    await expect(page).toHaveURL(/\/spot\/.*\/confirm/);

    // Navigate to history
    await page.goto('/history', { waitUntil: 'domcontentloaded' });

    // Should show the saved spot in the list
    await expect(page.getByTestId('history-spot-item')).toBeVisible();
  });

  test('should show spots in reverse chronological order (AC2)', async ({ page, context }) => {
    // Grant geolocation permission
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

    // Enter guest mode
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();

    // Save first spot
    await page.getByTestId('save-spot-button').click();
    await expect(page).toHaveURL(/\/spot\/.*\/confirm/);

    // Go back home
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Change location and save second spot
    await context.setGeolocation({ latitude: 40.7500, longitude: -73.9800 });
    await page.getByTestId('save-spot-button').click();
    await expect(page).toHaveURL(/\/spot\/.*\/confirm/);

    // Navigate to history
    await page.goto('/history', { waitUntil: 'domcontentloaded' });

    // Should show both spots (newest first - the 40.75° spot)
    const spotItems = page.getByTestId('history-spot-item');
    await expect(spotItems).toHaveCount(2);

    // First item should be the newer spot
    const firstItem = spotItems.first();
    await expect(firstItem).toContainText('40.75');
  });
});