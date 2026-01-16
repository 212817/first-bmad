# 3. Component Architecture

### 3.1 Component Hierarchy

```
<App>
├── <ErrorBoundary level="app">           # App-level errors
│   ├── <AuthProvider>
│   │   ├── <Router>
│   │   │   ├── <Layout>
│   │   │   │   ├── <Header />
│   │   │   │   ├── <ErrorBoundary level="page">  # Page-level errors
│   │   │   │   │   ├── <HomePage />
│   │   │   │   │   ├── <ParkPage />
│   │   │   │   │   ├── <HistoryPage />
│   │   │   │   │   └── <SettingsPage />
│   │   │   │   └── <BottomNav />
```

### 3.2 ErrorBoundary Implementation

```typescript
// components/common/ErrorBoundary.tsx
import { Component, ReactNode } from "react";
import { captureError } from "@/adapters/monitoring";
import { ErrorFallback } from "./ErrorFallback";

interface Props {
  children: ReactNode;
  level: "app" | "page" | "component";
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    captureError(error, {
      level: this.props.level,
      componentStack: info.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <ErrorFallback
          error={this.state.error}
          level={this.props.level}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    return this.props.children;
  }
}
```

### 3.3 Component Template

```typescript
// components/parking/ParkingCard.tsx
import type { ParkingCardProps } from "./types";

export function ParkingCard({ spot, onNavigate, onClear }: ParkingCardProps) {
  // ❌ AVOID: No useCallback/useMemo unless proven needed
  // ✅ DO: Simple event handlers
  const handleNavigate = () => {
    onNavigate(spot.id);
  };

  const handleClear = () => {
    onClear(spot.id);
  };

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <h3 className="text-lg font-medium">
        {spot.address || "Unknown location"}
      </h3>
      {spot.photoUrl && (
        <img
          src={spot.photoUrl}
          alt="Parking spot"
          className="mt-2 h-48 w-full rounded object-cover"
        />
      )}
      <div className="mt-4 flex gap-2">
        <button onClick={handleNavigate} className="btn-primary flex-1">
          Navigate
        </button>
        <button onClick={handleClear} className="btn-secondary flex-1">
          Clear
        </button>
      </div>
    </div>
  );
}
```

---
