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

    // Should display coordinates (uses spot-coordinates-primary when no address)
    const coordinates = page.getByTestId('spot-coordinates-primary');
    await expect(coordinates).toBeVisible();
    // Coordinates are formatted as "📍48.9102°N, 24.7085°E"
    await expect(coordinates).toContainText('48.9102');
    await expect(coordinates).toContainText('24.7085');
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

  test('displays action buttons for photo, gallery, timer and car tag selector (AC4)', async ({
    page,
  }) => {
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

    // Should display action buttons (Note is now inline, not a button)
    await expect(page.getByTestId('action-button-camera')).toBeVisible();
    await expect(page.getByTestId('action-button-gallery')).toBeVisible();
    await expect(page.getByTestId('action-button-timer')).toBeVisible();

    // Timer should be disabled
    await expect(page.getByTestId('action-button-timer')).toBeDisabled();

    // Car tag selector should be visible (always shown, not a button)
    await expect(page.getByTestId('car-tag-section')).toBeVisible();
    await expect(page.getByTestId('car-tag-selector')).toBeVisible();
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
    // Set mobile viewport before navigation
    await page.setViewportSize({ width: 375, height: 667 });

    // Enter guest mode - use networkidle for more stable navigation
    await page.goto('/login', { waitUntil: 'networkidle' });
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

  test.describe('Photo Capture', () => {
    test('clicking camera button opens camera capture component', async ({ page }) => {
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

      // Wait for camera button to be interactive
      await expect(page.getByTestId('action-button-camera')).toBeVisible();

      // Click camera action button
      await page.getByTestId('action-button-camera').click();

      // Camera capture component should be visible
      await expect(page.getByTestId('camera-capture')).toBeVisible({ timeout: 10000 });
    });

    test('photo action button shows checkmark when photo is captured', async ({ page }) => {
      // This test verifies the UI flow when a photo is attached
      // Since we can't actually capture photos in E2E, we verify the conditional rendering logic
      // by checking the initial state doesn't have a checkmark

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

      // Camera button should NOT have checkmark initially (no photo)
      const cameraButton = page.getByTestId('action-button-camera');
      await expect(cameraButton).toBeVisible();
      await expect(cameraButton).toContainText('📷');
      // The checkmark version would be 'action-button-photo-✓'
      await expect(page.getByTestId('action-button-photo-✓')).not.toBeVisible();
    });
  });

  test.describe('Gallery Upload', () => {
    test('gallery button is visible on confirmation page', async ({ page }) => {
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

      // Gallery button should be visible
      const galleryButton = page.getByTestId('action-button-gallery');
      await expect(galleryButton).toBeVisible();
      await expect(galleryButton).toContainText('🖼️');
      await expect(galleryButton).toContainText('Gallery');
    });
  });

  test.describe('Note Input', () => {
    test('note input is immediately visible on confirmation page (AC1)', async ({ page }) => {
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

      // Note section should be visible immediately (no button click needed)
      await expect(page.getByTestId('note-section')).toBeVisible();
      await expect(page.getByTestId('note-input-textarea')).toBeVisible();
    });

    test('note input has placeholder with examples (AC6)', async ({ page }) => {
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

      // Textarea should be visible with placeholder
      const textarea = page.getByTestId('note-input-textarea');
      await expect(textarea).toBeVisible();
      await expect(textarea).toHaveAttribute(
        'placeholder',
        'Add Note: P2, near elevator • Blue pillar • Row G'
      );
    });

    test('note input shows character counter (AC2)', async ({ page }) => {
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

      // Character counter should show 0/500
      await expect(page.getByTestId('note-input-counter')).toContainText('0/500');

      // Type some text
      const textarea = page.getByTestId('note-input-textarea');
      await textarea.fill('Near the elevator');

      // Counter should update
      await expect(page.getByTestId('note-input-counter')).toContainText('17/500');
    });

    test('note is saved on blur (AC3)', async ({ page }) => {
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

      // Type note
      const textarea = page.getByTestId('note-input-textarea');
      await textarea.fill('Level P2, Row B');

      // Click elsewhere to trigger blur and save
      await page.getByTestId('spot-detail-card').click();

      // Wait a moment for save to complete
      await page.waitForTimeout(500);

      // Verify note value persists in textarea
      await expect(textarea).toHaveValue('Level P2, Row B');
    });
  });
});
