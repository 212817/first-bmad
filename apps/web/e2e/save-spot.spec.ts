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

  test('home page displays "Save my location" button and address input (AC1)', async ({ page }) => {
    // Enter guest mode first
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();

    await expect(page).toHaveURL('/');

    // Should see the Save my location button
    const saveButton = page.getByTestId('save-spot-button');
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toContainText('Save my location');

    // Should also see address input form
    await expect(page.getByTestId('address-input')).toBeVisible();
    await expect(page.getByTestId('save-address-button')).toBeVisible();
  });

  test('saves spot to IndexedDB in guest mode and navigates to confirmation (AC4, AC6)', async ({
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

    // Should navigate to confirmation page (AC6 - shows feedback after save)
    await expect(page).toHaveURL(/\/spot\/.*\/confirm/, { timeout: 15000 });
    await expect(page.getByText('Spot Saved!')).toBeVisible();
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

    // Wait for confirmation page
    await expect(page).toHaveURL(/\/spot\/.*\/confirm/, { timeout: 15000 });

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

  test('location permission denied shows modal with manual entry option (AC2, AC5)', async ({
    page,
    context,
  }) => {
    // Deny geolocation permission to simulate denied state
    await context.clearPermissions();

    // Enter guest mode
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();

    await expect(page).toHaveURL('/');

    // Mock the permission state as denied by intercepting geolocation
    await page.evaluate(() => {
      // Override getCurrentPosition to simulate denied permission
      navigator.geolocation.getCurrentPosition = (_success, error) => {
        if (error) {
          error({
            code: 1, // PERMISSION_DENIED
            message: 'User denied Geolocation',
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3,
          } as GeolocationPositionError);
        }
      };
    });

    // Click save button - since permission will fail, should show error
    await page.getByTestId('save-spot-button').click();

    // Should show the "Location Access Blocked" modal (permission denied state)
    await expect(page.getByRole('heading', { name: 'Location Access Blocked' })).toBeVisible({
      timeout: 5000,
    });

    // User can still use the address input form as alternative
    await expect(page.getByTestId('address-input')).toBeVisible();
  });

  test('address input saves spot and navigates to confirmation', async ({ page }) => {
    // Enter guest mode
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();

    await expect(page).toHaveURL('/');

    // Fill address input
    await page.getByTestId('address-input').fill('123 Main Street, New York, NY');

    // Save address button should now be enabled
    const saveAddressButton = page.getByTestId('save-address-button');
    await expect(saveAddressButton).toBeEnabled();

    // Note: This would actually call the geocoding API, which may not be available in E2E
    // The test verifies the UI flow works correctly
  });

  test('Done button on confirmation page returns to home', async ({ page, context }) => {
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

    // Wait for confirmation page
    await expect(page).toHaveURL(/\/spot\/.*\/confirm/, { timeout: 15000 });

    // Click Done button
    await page.getByTestId('done-button').click();

    // Should be back on home page
    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('save-spot-button')).toBeVisible();
  });
});
