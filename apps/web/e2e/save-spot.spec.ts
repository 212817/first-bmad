// apps/web/e2e/save-spot.spec.ts
import { test, expect } from '@playwright/test';

const DB_NAME = 'wdip-local';

test.describe('Save Spot', () => {
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

  test('home page displays "Save my spot" button (AC1)', async ({ page }) => {
    // Enter guest mode first
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();

    await expect(page).toHaveURL('/');

    // Should see the Save my spot button
    const saveButton = page.getByTestId('save-spot-button');
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toContainText('Save my spot');
  });

  test('saves spot to IndexedDB in guest mode with success message (AC4, AC6)', async ({
    page,
    context,
  }) => {
    // Grant geolocation permission before navigating
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({
      latitude: 40.7128,
      longitude: -74.006,
      accuracy: 10,
    });

    // Enter guest mode
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();

    await expect(page).toHaveURL('/');

    // Click save button
    await page.getByTestId('save-spot-button').click();

    // If permission prompt is shown, click "Enable Location"
    const enableButton = page.getByRole('button', { name: /enable location/i });
    if (await enableButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await enableButton.click();
    }

    // Wait for success message (AC6 - shows feedback after save)
    await expect(page.getByTestId('success-message')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Spot saved successfully!')).toBeVisible();
  });

  test('saved spot data includes required fields (AC7)', async ({ page, context }) => {
    // Grant geolocation permission
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({
      latitude: 40.7128,
      longitude: -74.006,
      accuracy: 15,
    });

    // Enter guest mode
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();

    await expect(page).toHaveURL('/');

    // Click save button
    await page.getByTestId('save-spot-button').click();

    // If permission prompt is shown, click "Enable Location"
    const enableButton = page.getByRole('button', { name: /enable location/i });
    if (await enableButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await enableButton.click();
    }

    // Wait for success message
    await expect(page.getByTestId('success-message')).toBeVisible({ timeout: 15000 });

    // Verify spot data structure in IndexedDB
    const spotData = await page.evaluate(async (dbName) => {
      return new Promise<any[]>((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('spots')) {
            resolve([]);
            return;
          }
          const tx = db.transaction('spots', 'readonly');
          const store = tx.objectStore('spots');
          const getAllRequest = store.getAll();
          getAllRequest.onsuccess = () => resolve(getAllRequest.result);
          getAllRequest.onerror = () => reject(getAllRequest.error);
        };
      });
    }, DB_NAME);

    expect(spotData).toHaveLength(1);
    const spot = spotData[0];

    // AC7: Spot data includes: id, user_id (null for guest), lat, lng, accuracy_meters, saved_at (UTC)
    expect(spot.id).toBeDefined();
    expect(typeof spot.id).toBe('string');
    expect(spot.lat).toBe(40.7128);
    expect(spot.lng).toBe(-74.006);
    expect(spot.accuracyMeters).toBe(15);
    expect(spot.savedAt).toBeDefined();
    // savedAt should be ISO string
    expect(new Date(spot.savedAt).toISOString()).toBe(spot.savedAt);
  });

  test('location permission prompt shows with manual entry option (AC2, AC5)', async ({ page }) => {
    // Don't grant any permissions - let app show permission prompt
    // Note: In Chromium, permission state starts as 'prompt' which triggers our custom prompt

    // Enter guest mode
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();

    await expect(page).toHaveURL('/');

    // Click save button - should show our custom permission prompt
    await page.getByTestId('save-spot-button').click();

    // Should show the location permission prompt (AC2)
    // Note: The prompt title is "Enable Location"
    await expect(page.getByRole('heading', { name: /enable location/i })).toBeVisible({
      timeout: 5000,
    });

    // Should have "Enter address manually" option (AC5)
    await expect(page.getByRole('button', { name: /enter address manually/i })).toBeVisible();
  });

  test('dismiss button closes success message', async ({ page, context }) => {
    // Grant geolocation permission
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({
      latitude: 40.7128,
      longitude: -74.006,
      accuracy: 10,
    });

    // Enter guest mode
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();

    await expect(page).toHaveURL('/');

    // Click save button
    await page.getByTestId('save-spot-button').click();

    // If permission prompt is shown, click "Enable Location"
    const enableButton = page.getByRole('button', { name: /enable location/i });
    if (await enableButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await enableButton.click();
    }

    // Wait for success message
    await expect(page.getByTestId('success-message')).toBeVisible({ timeout: 15000 });

    // Click dismiss
    await page.getByRole('button', { name: /dismiss/i }).click();

    // Success message should be hidden
    await expect(page.getByTestId('success-message')).not.toBeVisible();
  });
});
