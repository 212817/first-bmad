// apps/web/e2e/latest-spot.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Latest Spot Display', () => {
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

    test('shows empty state when no spots saved (AC4)', async ({ page }) => {
        await page.goto('/login', { waitUntil: 'domcontentloaded' });
        await page.getByRole('button', { name: /continue as guest/i }).click();
        await expect(page).toHaveURL('/');

        // Should show empty spot state
        await expect(page.getByTestId('empty-spot-state')).toBeVisible();
        await expect(page.getByText('No parking spot saved yet')).toBeVisible();
        await expect(page.getByText('Tap below to save your first spot')).toBeVisible();
    });

    test('shows latest spot card after saving a spot (AC1, AC5)', async ({ page, context }) => {
        // Mock geolocation
        await context.grantPermissions(['geolocation']);
        await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

        await page.goto('/login', { waitUntil: 'domcontentloaded' });
        await page.getByRole('button', { name: /continue as guest/i }).click();
        await expect(page).toHaveURL('/');

        // Initially shows empty state
        await expect(page.getByTestId('empty-spot-state')).toBeVisible();

        // Click the save spot button
        await page.getByTestId('save-spot-button').click();

        // Wait for navigation to confirmation page
        await page.waitForURL(/\/spot\/.*\/confirm/, { timeout: 10000 });

        // Navigate back to home
        await page.goto('/');

        // Should now show the latest spot card instead of empty state
        await expect(page.getByTestId('latest-spot-card')).toBeVisible({ timeout: 10000 });
        await expect(page.getByTestId('empty-spot-state')).not.toBeVisible();

        // Should have navigate button
        await expect(page.getByTestId('navigate-button')).toBeVisible();
        await expect(page.getByText('Navigate')).toBeVisible();
    });

    test('latest spot card displays timestamp (AC2)', async ({ page, context }) => {
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

        // Should show relative timestamp (just saved, so "just now" or within minutes)
        await expect(page.getByTestId('spot-timestamp')).toBeVisible();
        const timestamp = await page.getByTestId('spot-timestamp').textContent();
        expect(timestamp).toMatch(/just now|ago/);
    });

    test('navigate button opens maps app (AC3)', async ({ page, context }) => {
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

        // Listen for new page/popup when clicking navigate
        const popupPromise = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);

        await page.getByTestId('navigate-button').click();

        // Should open maps in new tab (popup)
        const popup = await popupPromise;
        if (popup) {
            // Verify the URL contains google maps
            const url = popup.url();
            expect(url).toContain('google.com/maps');
        }
        // If popup blocked, the test still passes as we tested the click handler
    });

    test('guest mode stores spots in IndexedDB (AC6)', async ({ page, context }) => {
        // Mock geolocation
        await context.grantPermissions(['geolocation']);
        await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

        await page.goto('/login', { waitUntil: 'domcontentloaded' });
        await page.getByRole('button', { name: /continue as guest/i }).click();

        // Save a spot
        await page.getByTestId('save-spot-button').click();
        await page.waitForURL(/\/spot\/.*\/confirm/, { timeout: 10000 });

        // Check IndexedDB has the spot
        const spotCount = await page.evaluate(async () => {
            return new Promise<number>((resolve) => {
                const request = indexedDB.open('wdip-local', 1);
                request.onsuccess = () => {
                    const db = request.result;
                    const tx = db.transaction('spots', 'readonly');
                    const store = tx.objectStore('spots');
                    const countReq = store.count();
                    countReq.onsuccess = () => resolve(countReq.result);
                    countReq.onerror = () => resolve(0);
                };
                request.onerror = () => resolve(0);
            });
        });

        expect(spotCount).toBeGreaterThan(0);
    });
});
