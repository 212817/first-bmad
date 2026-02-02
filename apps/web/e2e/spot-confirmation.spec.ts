// apps/web/e2e/spot-confirmation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Spot Confirmation Page', () => {
  test.beforeEach(async ({ page, context }) => {
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

    // Grant geolocation permission
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({
      latitude: 48.9102,
      longitude: 24.7085,
      accuracy: 15,
    });
  });

  test('navigates to confirmation page after saving spot (AC1)', async ({ page }) => {
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

    // Should navigate to confirmation page
    await expect(page).toHaveURL(/\/spot\/.*\/confirm/, { timeout: 15000 });
    await expect(page.getByTestId('spot-confirmation-page')).toBeVisible();
    await expect(page.getByText('Spot Saved!')).toBeVisible();
  });

  test('displays saved coordinates on confirmation page (AC2)', async ({ page }) => {
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
    await expect(page.getByTestId('spot-confirmation-page')).toBeVisible({ timeout: 15000 });

    // Should display coordinates
    const coordinates = page.getByTestId('spot-coordinates');
    await expect(coordinates).toBeVisible();
    // Coordinates should contain the lat/lng values
    await expect(coordinates).toContainText('48.910200');
    await expect(coordinates).toContainText('24.708500');
  });

  test('displays timestamp on confirmation page (AC3)', async ({ page }) => {
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
    await expect(page.getByTestId('spot-confirmation-page')).toBeVisible({ timeout: 15000 });

    // Should display relative time
    const relativeTime = page.getByTestId('spot-relative-time');
    await expect(relativeTime).toBeVisible();
    await expect(relativeTime).toContainText('Just now');
  });

  test('displays action buttons for photo, note, tag, timer (AC4)', async ({ page }) => {
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
    await expect(page.getByTestId('spot-confirmation-page')).toBeVisible({ timeout: 15000 });

    // Should display all action buttons
    await expect(page.getByTestId('action-button-photo')).toBeVisible();
    await expect(page.getByTestId('action-button-note')).toBeVisible();
    await expect(page.getByTestId('action-button-tag')).toBeVisible();
    await expect(page.getByTestId('action-button-timer')).toBeVisible();

    // Timer should be disabled
    await expect(page.getByTestId('action-button-timer')).toBeDisabled();
  });

  test('Done button returns to home screen (AC5, AC7)', async ({ page }) => {
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
    await expect(page.getByTestId('spot-confirmation-page')).toBeVisible({ timeout: 15000 });

    // Click Done button
    await page.getByTestId('done-button').click();

    // Should navigate back to home
    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('save-spot-button')).toBeVisible();
  });

  test('Navigate Now button is visible (AC6)', async ({ page }) => {
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
    await expect(page.getByTestId('spot-confirmation-page')).toBeVisible({ timeout: 15000 });

    // Navigate Now button should be visible
    await expect(page.getByTestId('navigate-button')).toBeVisible();
    await expect(page.getByText('Navigate Now')).toBeVisible();
  });

  test('shows spot detail card with map preview placeholder', async ({ page }) => {
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
    await expect(page.getByTestId('spot-confirmation-page')).toBeVisible({ timeout: 15000 });

    // Should display spot detail card with map preview
    await expect(page.getByTestId('spot-detail-card')).toBeVisible();
    await expect(page.getByText('Map Preview')).toBeVisible();
  });

  test('confirmation page is accessible on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

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
    await expect(page.getByTestId('spot-confirmation-page')).toBeVisible({ timeout: 15000 });

    // All key elements should be visible on mobile
    await expect(page.getByText('Spot Saved!')).toBeVisible();
    await expect(page.getByTestId('spot-detail-card')).toBeVisible();
    await expect(page.getByTestId('spot-actions')).toBeVisible();
    await expect(page.getByTestId('done-button')).toBeVisible();
    await expect(page.getByTestId('navigate-button')).toBeVisible();
  });
});
