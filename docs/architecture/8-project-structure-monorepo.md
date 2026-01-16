# 8. Project Structure (Monorepo)

```
where-did-i-park/
├── apps/
│   ├── web/                      # React PWA (see architecture-frontend.md)
│   └── api/                      # Express API (see architecture-backend.md)
├── packages/
│   └── shared/                   # Shared code
│       ├── src/
│       │   ├── types/            # Shared TypeScript types
│       │   │   ├── models.ts     # User, ParkingSpot, CarTag
│       │   │   ├── api.ts        # Request/Response types
│       │   │   └── index.ts
│       │   ├── validation/       # Zod schemas
│       │   │   ├── spot.ts
│       │   │   ├── auth.ts
│       │   │   └── index.ts
│       │   ├── constants/        # Shared constants
│       │   │   ├── limits.ts
│       │   │   └── index.ts
│       │   ├── errors/           # Error classes
│       │   │   └── index.ts
│       │   └── db/               # Drizzle schema (BE only)
│       │       ├── schema.ts
│       │       └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
└── .env.example
```

---
