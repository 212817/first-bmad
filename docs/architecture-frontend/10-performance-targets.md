# 10. Performance Targets

| Metric                         | Target  | Measurement      |
| ------------------------------ | ------- | ---------------- |
| LCP (Largest Contentful Paint) | < 2.5s  | Vercel Analytics |
| FID (First Input Delay)        | < 100ms | Vercel Analytics |
| CLS (Cumulative Layout Shift)  | < 0.1   | Vercel Analytics |
| Bundle Size (gzipped)          | < 100KB | Build output     |
| Time to Interactive            | < 3s    | Lighthouse       |

### 10.1 Performance Best Practices

1. **Lazy load routes** - `React.lazy()` for code splitting
2. **Optimize images** - Compress before upload, use WebP
3. **Avoid memoization** - No `useCallback`/`useMemo` unless proven needed
4. **Tree shake** - Import only what's needed
5. **Prefetch** - Prefetch likely next routes

---
