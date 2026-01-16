# 6. External Services

### 6.1 Service Configuration

| Service                | Purpose        | Rate Limit         | Fallback           |
| ---------------------- | -------------- | ------------------ | ------------------ |
| **Google OAuth 2.0**   | Authentication | Unlimited          | Apple Sign-In      |
| **Apple Sign-In**      | Authentication | Unlimited          | Google OAuth       |
| **OpenCage Geocoding** | Address lookup | 2,500/day free     | Return coords only |
| **Cloudflare R2**      | Photo storage  | 10M req/month      | Disable photos     |
| **Neon PostgreSQL**    | Database       | Connection pooling | N/A (critical)     |

### 6.2 Environment Variables

```bash
# Shared
NODE_ENV=production

# Auth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
APPLE_CLIENT_ID=xxx
APPLE_TEAM_ID=xxx
APPLE_KEY_ID=xxx
APPLE_PRIVATE_KEY=xxx

# JWT
JWT_ACCESS_SECRET=xxx
JWT_REFRESH_SECRET=xxx
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Database
DATABASE_URL=postgres://...

# Storage
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=parking-photos
R2_PUBLIC_URL=https://photos.wheredidipark.app

# Geocoding
OPENCAGE_API_KEY=xxx

# Frontend (VITE_ prefix)
VITE_API_URL=https://api.wheredidipark.app
VITE_GOOGLE_CLIENT_ID=xxx
VITE_SENTRY_DSN=xxx
```

---
