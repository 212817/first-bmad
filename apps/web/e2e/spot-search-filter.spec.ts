// apps/web/e2e/spot-search-filter.spec.ts
// E2E tests for Story 3.6: Search and Filter Spot History
import { test, expect } from '@playwright/test';

test.describe('Spot Search and Filter', () => {
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
  });

  test('AC1: Search input visible on history screen', async ({ page }) => {
    // Enter guest mode
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();
    await expect(page).toHaveURL('/');

    // Navigate to history
    await page.goto('/history', { waitUntil: 'domcontentloaded' });

    // Search input should be visible
    await expect(page.getByTestId('spot-search-input')).toBeVisible();
  });

  test('AC5: Car tag filter dropdown available', async ({ page }) => {
    // Enter guest mode
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();
    await expect(page).toHaveURL('/');

    // Navigate to history
    await page.goto('/history', { waitUntil: 'domcontentloaded' });

    // Filter button should be visible
    await expect(page.getByTestId('filter-button')).toBeVisible();
  });

  test('AC2, AC11: Search filters spots by address (guest mode)', async ({ page, context }) => {
    // Set location with known coordinates
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

    // Enter guest mode
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();
    await expect(page).toHaveURL('/');

    // Save a spot
    await page.getByTestId('save-spot-button').click();
    await expect(page).toHaveURL(/\/spot\/.*\/confirm/);

    // Navigate to history
    await page.goto('/history', { waitUntil: 'domcontentloaded' });

    // Wait for spot to appear
    const spotItem = page.getByTestId('history-spot-item');
    await expect(spotItem).toBeVisible();

    // Search for a coordinate that exists
    await page.getByTestId('search-input').fill('40.71');

    // Spot should still be visible (coordinate matches)
    await expect(spotItem).toBeVisible();

    // Search for something that doesn't exist
    await page.getByTestId('search-input').fill('zzznonexistent');

    // Wait for debounce and should see no results
    await expect(page.getByTestId('no-results-state')).toBeVisible({ timeout: 2000 });
  });

  test('AC8: No results message when nothing matches', async ({ page, context }) => {
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

    // Enter guest mode
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();

    // Save a spot
    await page.getByTestId('save-spot-button').click();
    await expect(page).toHaveURL(/\/spot\/.*\/confirm/);

    // Navigate to history
    await page.goto('/history', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('history-spot-item')).toBeVisible();

    // Search for non-existent text
    await page.getByTestId('search-input').fill('nonexistenttextxyz');

    // Should see no results state
    await expect(page.getByTestId('no-results-state')).toBeVisible({ timeout: 2000 });
    await expect(page.getByText('No spots found')).toBeVisible();
  });

  test('AC9: Clear filters button resets to show all spots', async ({ page, context }) => {
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

    // Enter guest mode
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();

    // Save a spot
    await page.getByTestId('save-spot-button').click();
    await expect(page).toHaveURL(/\/spot\/.*\/confirm/);

    // Navigate to history
    await page.goto('/history', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('history-spot-item')).toBeVisible();

    // Search for non-existent text to trigger no results
    await page.getByTestId('search-input').fill('nonexistenttextxyz');
    await expect(page.getByTestId('no-results-state')).toBeVisible({ timeout: 2000 });

    // Click clear filters button
    await page.getByTestId('clear-filters-button').click();

    // Spot should be visible again
    await expect(page.getByTestId('history-spot-item')).toBeVisible();
    // No results state should be hidden
    await expect(page.getByTestId('no-results-state')).not.toBeVisible();
  });

  test('AC3: Search is case-insensitive', async ({ page, context }) => {
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

    // Enter guest mode
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();

    // Save a spot
    await page.getByTestId('save-spot-button').click();
    await expect(page).toHaveURL(/\/spot\/.*\/confirm/);

    // Add a note with specific case
    const noteInput = page.getByTestId('spot-note-input');
    if (await noteInput.isVisible()) {
      await noteInput.fill('TestNote123');
    }

    // Navigate to history
    await page.goto('/history', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('history-spot-item')).toBeVisible();

    // Search lowercase (should still find uppercase note)
    await page.getByTestId('search-input').fill('testnote');

    // Should still find the spot
    await expect(page.getByTestId('history-spot-item')).toBeVisible();
  });

  test('AC7: Results update as user types (debounced)', async ({ page, context }) => {
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

    // Enter guest mode
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();

    // Save a spot
    await page.getByTestId('save-spot-button').click();
    await expect(page).toHaveURL(/\/spot\/.*\/confirm/);

    // Navigate to history
    await page.goto('/history', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('history-spot-item')).toBeVisible();

    // Type gradually to test debounce
    const searchInput = page.getByTestId('search-input');
    await searchInput.fill('no');
    await searchInput.fill('non');
    await searchInput.fill('none');
    await searchInput.fill('nonexistent');

    // After debounce, should show no results
    await expect(page.getByTestId('no-results-state')).toBeVisible({ timeout: 2000 });
  });

  test('Search input clear button clears the search', async ({ page, context }) => {
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

    // Enter guest mode
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();

    // Save a spot
    await page.getByTestId('save-spot-button').click();
    await expect(page).toHaveURL(/\/spot\/.*\/confirm/);

    // Navigate to history
    await page.goto('/history', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('history-spot-item')).toBeVisible();

    // Enter search text
    const searchInput = page.getByTestId('search-input');
    await searchInput.fill('nonexistent');
    await expect(page.getByTestId('no-results-state')).toBeVisible({ timeout: 2000 });

    // Click clear button
    await page.getByTestId('search-clear-button').click();

    // Search input should be empty
    await expect(searchInput).toHaveValue('');

    // Spot should be visible again
    await expect(page.getByTestId('history-spot-item')).toBeVisible();
  });
});
