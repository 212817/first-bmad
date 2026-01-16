# 14. Deployment (Vercel)

### 14.1 Vercel Configuration

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/api/src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/v1/(.*)",
      "dest": "apps/api/src/index.ts"
    },
    {
      "src": "/health",
      "dest": "apps/api/src/index.ts"
    }
  ]
}
```

### 14.2 Environment Variables (Vercel Dashboard)

```
DATABASE_URL=postgres://...
JWT_ACCESS_SECRET=xxx
JWT_REFRESH_SECRET=xxx
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=parking-photos
OPENCAGE_API_KEY=xxx
SENTRY_DSN=xxx
```
