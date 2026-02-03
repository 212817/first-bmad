// apps/web/e2e/manual-address-entry.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Manual Address Entry', () => {
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
    test.beforeEach(async ({ page }) => {
      // Enter guest mode
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.getByRole('button', { name: /continue as guest/i }).click();
      await expect(page).toHaveURL('/');
    });

    test('can navigate to manual entry page', async ({ page }) => {
      await page.goto('/spots/manual', { waitUntil: 'domcontentloaded' });

      // Should see the page title
      await expect(page.getByText('Enter Address Manually')).toBeVisible();

      // Should see the address input
      await expect(page.getByPlaceholder(/123 Main St/i)).toBeVisible();
    });

    test('shows guest mode warning on manual entry page', async ({ page }) => {
      await page.goto('/spots/manual', { waitUntil: 'domcontentloaded' });

      // Should show the guest mode warning about local storage
      await expect(
        page.getByText(/Address will be saved locally without looking up coordinates/i)
      ).toBeVisible();
    });

    test('can save spot with address only in guest mode (AC5)', async ({ page }) => {
      await page.goto('/spots/manual', { waitUntil: 'domcontentloaded' });

      // Enter an address
      await page.getByPlaceholder(/123 Main St/i).fill('123 Test Street, New York, NY');

      // Submit the form
      await page.getByRole('button', { name: /save spot/i }).click();

      // Should navigate to confirmation page
      await expect(page).toHaveURL(/\/spot\/[^/]+\/confirm/);

      // Should see the confirmation page
      await expect(page.getByText('Spot Saved!')).toBeVisible();

      // Should see the address in the spot details
      await expect(page.getByText('123 Test Street, New York, NY')).toBeVisible();
    });

    test('shows no coordinates warning on confirmation page (AC6)', async ({ page }) => {
      await page.goto('/spots/manual', { waitUntil: 'domcontentloaded' });

      // Enter an address
      await page.getByPlaceholder(/123 Main St/i).fill('789 Guest Mode Test');

      // Submit the form
      await page.getByRole('button', { name: /save spot/i }).click();

      // Should navigate to confirmation page
      await expect(page).toHaveURL(/\/spot\/[^/]+\/confirm/);

      // Should show warning about no GPS coordinates
      await expect(
        page.getByText(/Navigation may be less accurate without GPS coordinates/i)
      ).toBeVisible();
    });

    test('address input validates minimum length', async ({ page }) => {
      await page.goto('/spots/manual', { waitUntil: 'domcontentloaded' });

      // Enter a too-short address
      await page.getByPlaceholder(/123 Main St/i).fill('ab');

      // Submit button should be disabled
      const submitButton = page.getByRole('button', { name: /save spot/i });
      await expect(submitButton).toBeDisabled();
    });

    test('can navigate back from manual entry page', async ({ page }) => {
      await page.goto('/spots/manual', { waitUntil: 'domcontentloaded' });

      // Click back button
      await page.getByRole('button', { name: /back/i }).click();

      // Should navigate to home
      await expect(page).toHaveURL('/');
    });
  });
});
