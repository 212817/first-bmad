# 12. Coding Standards

### 12.1 Critical Rules

1. ❌ **No `useCallback`/`useMemo`** unless proven performance issue
2. ✅ **Types in `types.ts`** per folder, not inline
3. ✅ **Each hook in own folder** with optional types.ts
4. ✅ **Tailwind for all styling** - no CSS modules
5. ✅ **ErrorBoundaries** at app/page/component levels
6. ✅ **Adapters for browser APIs** - testable wrappers

### 12.2 Naming Conventions

| Item       | Convention             | Example            |
| ---------- | ---------------------- | ------------------ |
| Components | PascalCase             | `ParkingCard.tsx`  |
| Hooks      | camelCase with `use`   | `useParking.ts`    |
| Stores     | camelCase with `Store` | `parkingStore.ts`  |
| Types      | PascalCase             | `ParkingCardProps` |
| Constants  | UPPER_SNAKE            | `MAX_PHOTO_SIZE`   |

### 12.3 Import Order

```typescript
// 1. React
import { useState, useEffect } from 'react';

// 2. External libraries
import { format } from 'date-fns';

// 3. Internal aliases (@/)
import { useAuth } from '@/hooks/useAuth/useAuth';
import { Button } from '@/components/common/Button';

// 4. Relative imports
import type { Props } from './types';
```

---
