// apps/web/e2e/sign-out.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Sign Out & Account Switching', () => {
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

  test.describe('Profile Menu for Guests (AC6)', () => {
    test('guest mode shows profile menu with Sign In button', async ({ page }) => {
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.getByRole('button', { name: /continue as guest/i }).click();
      await expect(page).toHaveURL('/');

      // Wait for hydration
      await page.waitForSelector('[data-testid="profile-menu-button"]');

      // Open profile menu
      const profileButton = page.getByTestId('profile-menu-button');
      await expect(profileButton).toBeVisible();
      await profileButton.click();

      // Should see Guest Mode info in dropdown (scoped to menu)
      const menu = page.getByRole('menu');
      await expect(menu.getByText('Guest Mode')).toBeVisible();
      await expect(menu.getByText('Data stored locally')).toBeVisible();

      // Should see Sign In, not Sign Out
      await expect(page.getByRole('menuitem', { name: /sign in/i })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: /sign out/i })).not.toBeVisible();
    });

    test('clicking Sign In from guest menu navigates to login', async ({ page }) => {
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.getByRole('button', { name: /continue as guest/i }).click();
      await expect(page).toHaveURL('/');

      // Wait for hydration
      await page.waitForSelector('[data-testid="profile-menu-button"]');

      // Open profile menu and click Sign In
      await page.getByTestId('profile-menu-button').click();
      await page.getByRole('menuitem', { name: /sign in/i }).click();

      // Should navigate to login
      await expect(page).toHaveURL('/login');
    });
  });

  test.describe('Guest to Authenticated flow (AC5)', () => {
    test('guest can navigate to login from profile menu', async ({ page }) => {
      // Enter guest mode
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.getByRole('button', { name: /continue as guest/i }).click();
      await expect(page).toHaveURL('/');

      // Wait for hydration
      await page.waitForSelector('[data-testid="profile-menu-button"]');

      // Open profile menu and click Sign In
      await page.getByTestId('profile-menu-button').click();
      await page.getByRole('menuitem', { name: /sign in/i }).click();

      // Should be on login page with Google button available
      await expect(page).toHaveURL('/login');
      await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
    });

    test('guest can re-enter guest mode after visiting login', async ({ page }) => {
      // Enter guest mode
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.getByRole('button', { name: /continue as guest/i }).click();
      await expect(page).toHaveURL('/');

      // Wait for hydration
      await page.waitForSelector('[data-testid="profile-menu-button"]');

      // Go to login via profile menu
      await page.getByTestId('profile-menu-button').click();
      await page.getByRole('menuitem', { name: /sign in/i }).click();
      await expect(page).toHaveURL('/login');

      // Can still use guest mode (button still visible)
      await expect(page.getByRole('button', { name: /continue as guest/i })).toBeVisible();

      // Click it to go back to guest mode
      await page.getByRole('button', { name: /continue as guest/i }).click();
      await expect(page).toHaveURL('/');
      await expect(page.getByText('Guest Mode - Data stored locally only')).toBeVisible();
    });
  });

  test.describe('Profile Menu Accessibility', () => {
    test('profile menu can be closed with Escape key', async ({ page }) => {
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.getByRole('button', { name: /continue as guest/i }).click();
      await expect(page).toHaveURL('/');

      // Wait for hydration
      await page.waitForSelector('[data-testid="profile-menu-button"]');

      // Open profile menu
      await page.getByTestId('profile-menu-button').click();
      await expect(page.getByRole('menu')).toBeVisible();

      // Press Escape
      await page.keyboard.press('Escape');

      // Menu should be closed
      await expect(page.getByRole('menu')).not.toBeVisible();
    });

    test('profile menu closes when clicking outside', async ({ page }) => {
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.getByRole('button', { name: /continue as guest/i }).click();
      await expect(page).toHaveURL('/');

      // Wait for hydration
      await page.waitForSelector('[data-testid="profile-menu-button"]');

      // Open profile menu
      await page.getByTestId('profile-menu-button').click();
      await expect(page.getByRole('menu')).toBeVisible();

      // Click outside (on the page body)
      await page.locator('body').click({ position: { x: 10, y: 10 } });

      // Menu should be closed
      await expect(page.getByRole('menu')).not.toBeVisible();
    });
  });
});
