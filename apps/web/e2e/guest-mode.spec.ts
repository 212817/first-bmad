// apps/web/e2e/guest-mode.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Guest Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Clear IndexedDB before each test to start fresh
    await page.goto('/');
    await page.evaluate(async () => {
      const databases = await indexedDB.databases();
      for (const db of databases) {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
        }
      }
    });
  });

  test('login page displays "Continue as Guest" button (AC1)', async ({ page }) => {
    await page.goto('/login');

    const guestButton = page.getByRole('button', { name: /continue as guest/i });
    await expect(guestButton).toBeVisible();
  });

  test('can enter guest mode from login and navigate to home (AC2)', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: /continue as guest/i }).click();

    // Should navigate to home
    await expect(page).toHaveURL('/');
  });

  test('guest mode displays persistent banner (AC3)', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /continue as guest/i }).click();

    // Should see guest mode banner
    await expect(page.getByText('Guest Mode - Data stored locally only')).toBeVisible();

    // Should see "Sign in to sync" link
    await expect(page.getByRole('link', { name: /sign in to sync/i })).toBeVisible();
  });

  test('guest state persists after page refresh (AC7)', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /continue as guest/i }).click();

    // Verify we're on home with banner
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Guest Mode - Data stored locally only')).toBeVisible();

    // Reload the page
    await page.reload();

    // Should still be on home with banner (not redirected to login)
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Guest Mode - Data stored locally only')).toBeVisible();
  });

  test('sign-in prompt appears on 3rd guest visit (AC6)', async ({ page, context }) => {
    // First visit
    await page.goto('/login');
    await page.getByRole('button', { name: /continue as guest/i }).click();
    await expect(page).toHaveURL('/');

    // Second visit - close and reopen
    await page.close();
    const page2 = await context.newPage();
    await page2.goto('/');
    await expect(page2.getByText('Guest Mode - Data stored locally only')).toBeVisible();

    // Third visit - close and reopen
    await page2.close();
    const page3 = await context.newPage();
    await page3.goto('/');

    // Should see sign-in prompt on 3rd visit
    await expect(page3.getByText('Sync your spots')).toBeVisible({ timeout: 5000 });
  });

  test('sign-in prompt can be dismissed (AC6)', async ({ page, context: _context }) => {
    // Simulate 3 visits to trigger prompt
    await page.goto('/login');
    await page.getByRole('button', { name: /continue as guest/i }).click();

    // Mock visit count to 3 via IndexedDB
    await page.evaluate(async () => {
      const request = indexedDB.open('wdip-local', 1);
      await new Promise<void>((resolve, reject) => {
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction('settings', 'readwrite');
          const store = tx.objectStore('settings');
          store.put({ guestVisitCount: 3 }, 'app');
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        };
        request.onerror = () => reject(request.error);
      });
    });

    // Reload to trigger prompt check
    await page.reload();

    // Wait for prompt to appear
    const prompt = page.getByText('Sync your spots');
    await expect(prompt).toBeVisible({ timeout: 5000 });

    // Dismiss the prompt
    await page.getByRole('button', { name: /maybe later/i }).click();

    // Prompt should disappear
    await expect(prompt).not.toBeVisible();

    // Reload - prompt should not reappear (dismissal persisted)
    await page.reload();
    await expect(page.getByText('Sync your spots')).not.toBeVisible({ timeout: 2000 });
  });
});
