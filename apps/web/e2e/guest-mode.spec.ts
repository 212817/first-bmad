// apps/web/e2e/guest-mode.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Guest Mode', () => {
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

  test('login page displays "Continue as Guest" button (AC1)', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    const guestButton = page.getByRole('button', { name: /continue as guest/i });
    await expect(guestButton).toBeVisible();
  });

  test('can enter guest mode from login and navigate to home (AC2)', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    await page.getByRole('button', { name: /continue as guest/i }).click();

    // Should navigate to home
    await expect(page).toHaveURL('/');
  });

  test('guest mode displays persistent banner (AC3)', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();

    // Should see guest mode banner
    await expect(page.getByText('Guest Mode - Some features are limited')).toBeVisible();

    // Should see "Sign in" button
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('guest state persists after page refresh (AC7)', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();

    // Verify we're on home with banner
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Guest Mode - Some features are limited')).toBeVisible();

    // Reload the page
    await page.reload();

    // Should still be on home with banner (not redirected to login)
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Guest Mode - Some features are limited')).toBeVisible();
  });

  test('sign-in prompt appears on 3rd guest visit (AC6)', async ({ page, context }) => {
    // First visit - enter guest mode
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();
    await expect(page).toHaveURL('/');
    // Wait for banner to confirm hydration is complete
    await expect(page.getByText('Guest Mode - Some features are limited')).toBeVisible();
    // Wait for IndexedDB visit count write to complete
    await page.waitForTimeout(1000);

    // Second visit - close and reopen
    await page.close();
    const page2 = await context.newPage();
    await page2.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page2.getByText('Guest Mode - Some features are limited')).toBeVisible();
    // Wait for IndexedDB visit count write to complete
    await page2.waitForTimeout(1000);

    // Third visit - close and reopen
    await page2.close();
    const page3 = await context.newPage();
    await page3.goto('/', { waitUntil: 'domcontentloaded' });
    // Wait for hydration and IndexedDB read
    await expect(page3.getByText('Guest Mode - Some features are limited')).toBeVisible();
    // Wait a bit for the useSignInPrompt hook to check visit count and show prompt
    await page3.waitForTimeout(500);

    // Should see sign-in prompt on 3rd visit
    await expect(page3.getByText('Sync your spots')).toBeVisible({ timeout: 15000 });
  });

  test('sign-in prompt can be dismissed (AC6)', async ({ page, context: _context }) => {
    // First enter guest mode
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue as guest/i }).click();
    await expect(page).toHaveURL('/');

    // Wait for hydration to complete
    await expect(page.getByText('Guest Mode - Some features are limited')).toBeVisible();

    // Mock visit count to 2 via IndexedDB (will become 3 on next load, triggering prompt)
    await page.evaluate(async () => {
      const request = indexedDB.open('wdip-local', 1);
      await new Promise<void>((resolve, reject) => {
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction('settings', 'readwrite');
          const store = tx.objectStore('settings');
          store.put({ guestVisitCount: 2 }, 'app');
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        };
        request.onerror = () => reject(request.error);
      });
    });

    // Reload to trigger prompt check (visit count goes from 2 to 3)
    await page.reload();
    await expect(page.getByText('Guest Mode - Some features are limited')).toBeVisible();

    // Wait for prompt to appear
    const prompt = page.getByText('Sync your spots');
    await expect(prompt).toBeVisible({ timeout: 10000 });

    // Dismiss the prompt
    await page.getByRole('button', { name: /maybe later/i }).click();

    // Wait for prompt to disappear and dismissal to persist
    await expect(prompt).not.toBeVisible();
    // Give time for IndexedDB write to complete
    await page.waitForTimeout(500);

    // Reload - prompt should not reappear (dismissal persisted)
    await page.reload();
    await expect(page.getByText('Guest Mode - Some features are limited')).toBeVisible();
    // Wait a bit for any async prompt logic, then verify it's not visible
    await page.waitForTimeout(1000);
    await expect(page.getByText('Sync your spots')).not.toBeVisible({ timeout: 2000 });
  });
});
