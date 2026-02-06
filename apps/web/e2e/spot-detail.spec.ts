// apps/web/e2e/spot-detail.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Spot Detail Page', () => {
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

  test('should navigate to spot detail from history list (AC9)', async ({ page, context }) => {
    // Grant geolocation permission
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

    // Enter guest mode
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();

    // Save a spot
    await page.getByTestId('save-spot-button').click();
    await expect(page).toHaveURL(/\/spot\/.*\/confirm/);

    // Navigate to history
    await page.goto('/history', { waitUntil: 'domcontentloaded' });

    // Wait for spot to appear and click on it
    const spotItem = page.getByTestId('history-spot-item');
    await expect(spotItem).toBeVisible();
    await spotItem.first().click();

    // Should navigate to spot detail page
    await expect(page).toHaveURL(/\/spot\/[^/]+$/);
    await expect(page.getByTestId('spot-detail-page')).toBeVisible();
  });

  test('should display coordinates prominently (AC2)', async ({ page, context }) => {
    // Grant geolocation permission
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

    // Enter guest mode
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();

    // Save a spot and go to detail
    await page.getByTestId('save-spot-button').click();
    await expect(page).toHaveURL(/\/spot\/.*\/confirm/);

    // Navigate to history and click the spot
    await page.goto('/history', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('history-spot-item').first().click();

    // Check location card is visible
    await expect(page.getByTestId('location-card')).toBeVisible();
  });

  test('should show saved timestamp (AC3)', async ({ page, context }) => {
    // Grant geolocation permission
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

    // Enter guest mode
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();

    // Save a spot
    await page.getByTestId('save-spot-button').click();
    await expect(page).toHaveURL(/\/spot\/.*\/confirm/);

    // Navigate to history and click the spot
    await page.goto('/history', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('history-spot-item').first().click();

    // Check timestamp is visible
    await expect(page.getByTestId('spot-timestamp')).toBeVisible();
    await expect(page.getByTestId('spot-timestamp')).toContainText('Saved');
  });

  test('should show car tag badge (AC5)', async ({ page, context }) => {
    // Grant geolocation permission
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

    // Enter guest mode
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();

    // Save a spot
    await page.getByTestId('save-spot-button').click();
    await expect(page).toHaveURL(/\/spot\/.*\/confirm/);

    // Navigate to history and click the spot
    await page.goto('/history', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('history-spot-item').first().click();

    // Check tag badge is visible with default tag
    await expect(page.getByTestId('tag-badge')).toBeVisible();
    await expect(page.getByTestId('tag-badge')).toContainText('My Car');
  });

  test('should have navigate button (AC6)', async ({ page, context }) => {
    // Grant geolocation permission
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

    // Enter guest mode
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();

    // Save a spot
    await page.getByTestId('save-spot-button').click();
    await expect(page).toHaveURL(/\/spot\/.*\/confirm/);

    // Navigate to history and click the spot
    await page.goto('/history', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('history-spot-item').first().click();

    // Check navigate button is visible and enabled
    const navigateButton = page.getByTestId('navigate-button');
    await expect(navigateButton).toBeVisible();
    await expect(navigateButton).toBeEnabled();
  });

  test('should have share button (disabled) (AC7)', async ({ page, context }) => {
    // Grant geolocation permission
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

    // Enter guest mode
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();

    // Save a spot
    await page.getByTestId('save-spot-button').click();
    await expect(page).toHaveURL(/\/spot\/.*\/confirm/);

    // Navigate to history and click the spot
    await page.goto('/history', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('history-spot-item').first().click();

    // Check share button is visible but disabled
    const shareButton = page.getByTestId('share-button');
    await expect(shareButton).toBeVisible();
    await expect(shareButton).toBeDisabled();
  });

  test('should have delete button (AC8)', async ({ page, context }) => {
    // Grant geolocation permission
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

    // Enter guest mode
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();

    // Save a spot
    await page.getByTestId('save-spot-button').click();
    await expect(page).toHaveURL(/\/spot\/.*\/confirm/);

    // Navigate to history and click the spot
    await page.goto('/history', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('history-spot-item').first().click();

    // Check delete button is visible
    const deleteButton = page.getByTestId('delete-button');
    await expect(deleteButton).toBeVisible();
    await expect(deleteButton).toBeEnabled();
  });

  test('should show full-width map when no photo (AC1)', async ({ page, context }) => {
    // Grant geolocation permission
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

    // Enter guest mode
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();

    // Save a spot (without photo)
    await page.getByTestId('save-spot-button').click();
    await expect(page).toHaveURL(/\/spot\/.*\/confirm/);

    // Navigate to history and click the spot
    await page.goto('/history', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('history-spot-item').first().click();

    // Check that the map is visible (when no photo, map takes full width)
    await expect(page.locator('.leaflet-container')).toBeVisible();
  });

  test('should copy coordinates when tapping coordinates button (AC2)', async ({
    page,
    context,
  }) => {
    // Grant geolocation permission
    await context.grantPermissions(['geolocation', 'clipboard-read', 'clipboard-write']);
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

    // Enter guest mode
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();

    // Save a spot
    await page.getByTestId('save-spot-button').click();
    await expect(page).toHaveURL(/\/spot\/.*\/confirm/);

    // Navigate to history and click the spot
    await page.goto('/history', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('history-spot-item').first().click();

    // Click location coordinates button to copy (not the card itself)
    await page.getByTestId('location-coordinates').click();

    // Verify clipboard contains coordinates
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toMatch(/\d+\.\d+, -?\d+\.\d+/);
  });

  test('should navigate back when clicking back button', async ({ page, context }) => {
    // Grant geolocation permission
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

    // Enter guest mode
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();

    // Save a spot
    await page.getByTestId('save-spot-button').click();
    await expect(page).toHaveURL(/\/spot\/.*\/confirm/);

    // Navigate to history and click the spot
    await page.goto('/history', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('history-spot-item').first().click();

    await expect(page.getByTestId('spot-detail-page')).toBeVisible();

    // Click back button
    await page.getByLabel('Go back').click();

    // Should navigate back to history
    await expect(page).toHaveURL('/history');
  });

  test('should show not found for invalid spot ID', async ({ page }) => {
    // Enter guest mode
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();

    // Wait for home page to load before navigating away
    await expect(page).toHaveURL('/');

    // Navigate directly to a non-existent spot
    await page.goto('/spot/non-existent-id', { waitUntil: 'domcontentloaded' });

    // Should show not found state
    await expect(page.getByTestId('spot-detail-not-found')).toBeVisible();
    await expect(page.getByText('Spot Not Found')).toBeVisible();
  });
});
