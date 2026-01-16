# 11. Testing Strategy

### 11.1 Coverage Targets

| Category           | Target | Tool                     |
| ------------------ | ------ | ------------------------ |
| Hooks              | 100%   | Vitest                   |
| Stores             | 95%    | Vitest                   |
| Components         | 95%    | Vitest + Testing Library |
| E2E Critical Paths | 100%   | Playwright               |

### 11.2 Unit Test Example

```typescript
// hooks/useAuth/__tests__/useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';

describe('useAuth', () => {
  it('should return unauthenticated state initially', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should redirect to OAuth on login', async () => {
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { href: '' } as Location;

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.login('google');
    });

    expect(window.location.href).toContain('/auth/google');

    window.location = originalLocation;
  });
});
```

### 11.3 E2E Test Example

```typescript
// e2e/parking.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Parking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth
    await page.goto('/');
  });

  test('should save parking spot with photo', async ({ page }) => {
    // Mock geolocation
    await page.context().grantPermissions(['geolocation']);
    await page.context().setGeolocation({ latitude: 40.7128, longitude: -74.006 });

    await page.click('[data-testid="park-button"]');
    await page.click('[data-testid="take-photo"]');

    // Verify spot saved
    await expect(page.locator('[data-testid="active-spot"]')).toBeVisible();
  });
});
```

---
