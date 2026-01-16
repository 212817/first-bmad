# 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SYSTEM OVERVIEW                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│    ┌──────────────┐         ┌──────────────┐         ┌──────────────┐   │
│    │   Browser    │         │   Vercel     │         │    Neon      │   │
│    │   (PWA)      │◄───────►│   Functions  │◄───────►│  PostgreSQL  │   │
│    │   React 19   │  REST   │   Express 5  │  Drizzle│    17.x      │   │
│    └──────────────┘         └──────────────┘         └──────────────┘   │
│           │                        │                                     │
│           │                        │                                     │
│           ▼                        ▼                                     │
│    ┌──────────────┐         ┌──────────────┐                            │
│    │ localStorage │         │ Cloudflare   │                            │
│    │ (offline)    │         │     R2       │                            │
│    └──────────────┘         │  (photos)    │                            │
│                             └──────────────┘                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Platform Choice

| Component            | Service          | Tier | Limit                |
| -------------------- | ---------------- | ---- | -------------------- |
| Frontend Hosting     | Vercel           | Free | 100GB bandwidth      |
| Backend (Serverless) | Vercel Functions | Free | 100GB-hrs            |
| Database             | Neon PostgreSQL  | Free | 0.5GB storage        |
| Photo Storage        | Cloudflare R2    | Free | 10GB, no egress fees |
| Auth Provider        | Google/Apple     | Free | Unlimited            |
| CI/CD                | GitHub Actions   | Free | 2000 min/month       |

**Total Monthly Cost: $0**

### 2.2 Key Architectural Patterns

| Pattern                | Usage                                     |
| ---------------------- | ----------------------------------------- |
| **Monorepo**           | pnpm workspaces - shared types/validation |
| **REST API**           | JSON over HTTPS, JWT auth                 |
| **Repository Pattern** | Data access abstraction                   |
| **Service Layer**      | Business logic isolation                  |
| **Optimistic Updates** | Instant UI feedback                       |
| **Signed URLs**        | Secure photo access                       |

---
