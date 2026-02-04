// apps/web/e2e/spot-delete.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Spot Delete Functionality', () => {
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

    test('should show delete button on spot detail page (AC1)', async ({ page, context }) => {
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

        // Verify delete button is visible
        await expect(page.getByTestId('delete-button')).toBeVisible();
    });

    test('should show confirmation dialog when delete clicked (AC2)', async ({ page, context }) => {
        await context.grantPermissions(['geolocation']);
        await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

        // Enter guest mode and save a spot
        await page.goto('/login', { waitUntil: 'domcontentloaded' });
        await page.getByRole('button', { name: /continue as guest/i }).click();
        await page.getByTestId('save-spot-button').click();
        await expect(page).toHaveURL(/\/spot\/.*\/confirm/);

        // Navigate to spot detail
        await page.goto('/history', { waitUntil: 'domcontentloaded' });
        await page.getByTestId('history-spot-item').first().click();

        // Click delete button
        await page.getByTestId('delete-button').click();

        // Verify dialog appears
        await expect(page.getByTestId('delete-confirm-dialog')).toBeVisible();
        await expect(page.getByTestId('delete-dialog-title')).toHaveText('Delete Parking Spot?');
    });

    test('should have Cancel and Delete buttons in dialog (AC3)', async ({ page, context }) => {
        await context.grantPermissions(['geolocation']);
        await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

        await page.goto('/login', { waitUntil: 'domcontentloaded' });
        await page.getByRole('button', { name: /continue as guest/i }).click();
        await page.getByTestId('save-spot-button').click();
        await expect(page).toHaveURL(/\/spot\/.*\/confirm/);

        await page.goto('/history', { waitUntil: 'domcontentloaded' });
        await page.getByTestId('history-spot-item').first().click();
        await page.getByTestId('delete-button').click();

        // Verify both buttons are present
        await expect(page.getByTestId('delete-cancel-button')).toBeVisible();
        await expect(page.getByTestId('delete-confirm-button')).toBeVisible();
    });

    test('should return to detail screen when Cancel clicked (AC4)', async ({ page, context }) => {
        await context.grantPermissions(['geolocation']);
        await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

        await page.goto('/login', { waitUntil: 'domcontentloaded' });
        await page.getByRole('button', { name: /continue as guest/i }).click();
        await page.getByTestId('save-spot-button').click();
        await expect(page).toHaveURL(/\/spot\/.*\/confirm/);

        await page.goto('/history', { waitUntil: 'domcontentloaded' });
        await page.getByTestId('history-spot-item').first().click();
        await page.getByTestId('delete-button').click();

        // Click cancel
        await page.getByTestId('delete-cancel-button').click();

        // Dialog should close, still on spot detail page
        await expect(page.getByTestId('delete-confirm-dialog')).not.toBeVisible();
        await expect(page.getByTestId('spot-detail-page')).toBeVisible();
    });

    test('should delete spot and return to history on confirm (AC5)', async ({ page, context }) => {
        await context.grantPermissions(['geolocation']);
        await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

        await page.goto('/login', { waitUntil: 'domcontentloaded' });
        await page.getByRole('button', { name: /continue as guest/i }).click();
        await page.getByTestId('save-spot-button').click();
        await expect(page).toHaveURL(/\/spot\/.*\/confirm/);

        await page.goto('/history', { waitUntil: 'domcontentloaded' });
        await page.getByTestId('history-spot-item').first().click();
        await page.getByTestId('delete-button').click();

        // Click confirm delete
        await page.getByTestId('delete-confirm-button').click();

        // Should navigate to history
        await expect(page).toHaveURL('/history');
    });

    test('should show empty state after deleting last spot (AC8)', async ({ page, context }) => {
        await context.grantPermissions(['geolocation']);
        await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

        await page.goto('/login', { waitUntil: 'domcontentloaded' });
        await page.getByRole('button', { name: /continue as guest/i }).click();

        // Save one spot
        await page.getByTestId('save-spot-button').click();
        await expect(page).toHaveURL(/\/spot\/.*\/confirm/);

        // Go to history and delete it
        await page.goto('/history', { waitUntil: 'domcontentloaded' });
        await page.getByTestId('history-spot-item').first().click();
        await page.getByTestId('delete-button').click();
        await page.getByTestId('delete-confirm-button').click();

        // Should see empty state on history page
        await expect(page).toHaveURL('/history');
        await expect(page.getByTestId('history-empty-state')).toBeVisible();
    });

    test('should delete from IndexedDB for guest users (AC10)', async ({ page, context }) => {
        await context.grantPermissions(['geolocation']);
        await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

        await page.goto('/login', { waitUntil: 'domcontentloaded' });
        await page.getByRole('button', { name: /continue as guest/i }).click();

        // Save a spot
        await page.getByTestId('save-spot-button').click();
        await expect(page).toHaveURL(/\/spot\/.*\/confirm/);

        // Verify spot exists in history
        await page.goto('/history', { waitUntil: 'domcontentloaded' });
        const spotCount = await page.getByTestId('history-spot-item').count();
        expect(spotCount).toBe(1);

        // Delete the spot
        await page.getByTestId('history-spot-item').first().click();
        await page.getByTestId('delete-button').click();
        await page.getByTestId('delete-confirm-button').click();

        // Verify spot is gone
        await expect(page).toHaveURL('/history');

        // Refresh page to verify IndexedDB was updated
        await page.reload({ waitUntil: 'domcontentloaded' });
        await expect(page.getByTestId('history-empty-state')).toBeVisible();
    });
});