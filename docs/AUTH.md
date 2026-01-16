# Authentication API Documentation

## Overview

The Where Did I Park API uses OAuth 2.0 with Google for authentication. User sessions are managed using JWT tokens (access + refresh tokens) stored in httpOnly cookies.

## Environment Variables

```bash
# Google OAuth (required)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# JWT Secrets (min 32 characters each)
JWT_ACCESS_SECRET=your-access-secret-at-least-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-at-least-32-characters-long
```

## Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable "Google+ API" or "People API" for user info
4. Go to APIs & Services > Credentials
5. Create OAuth 2.0 Client ID (Web application)
6. Add authorized redirect URIs:
   - Development: `http://localhost:3001/v1/auth/google/callback`
   - Production: `https://api.yourdomain.com/v1/auth/google/callback`
7. Copy Client ID and Client Secret to your `.env` file

## API Endpoints

### Initiate Google OAuth

```
GET /v1/auth/google
```

Redirects user to Google consent screen.

**Example (curl):**
```bash
# Opens browser for OAuth flow
curl -v http://localhost:3001/v1/auth/google
```

### OAuth Callback

```
GET /v1/auth/google/callback?code={authorization_code}
```

Handles OAuth callback, creates/retrieves user, sets cookies, redirects to frontend.

### Get Current User

```
GET /v1/auth/me
```

Returns authenticated user info.

**Headers:**
- `Cookie: accessToken={jwt}` (set automatically)
- OR `Authorization: Bearer {jwt}`

**Example (curl):**
```bash
curl -v http://localhost:3001/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "displayName": "John Doe",
    "avatarUrl": "https://lh3.googleusercontent.com/..."
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Access token required"
  }
}
```

### Refresh Access Token

```
POST /v1/auth/refresh
```

Refreshes access token using refresh token cookie.

**Example (curl):**
```bash
curl -X POST http://localhost:3001/v1/auth/refresh \
  -H "Cookie: refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "displayName": "John Doe",
    "avatarUrl": "https://lh3.googleusercontent.com/..."
  }
}
```

### Logout

```
POST /v1/auth/logout
```

Invalidates refresh token and clears cookies.

**Example (curl):**
```bash
curl -X POST http://localhost:3001/v1/auth/logout \
  -H "Cookie: refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**
```json
{
  "success": true,
  "data": null
}
```

## Token Details

| Token | Location | Expiry | Purpose |
|-------|----------|--------|---------|
| Access Token | httpOnly cookie `accessToken` | 15 minutes | API authentication |
| Refresh Token | httpOnly cookie `refreshToken` | 7 days | Obtain new access tokens |

## Cookie Settings

```javascript
{
  httpOnly: true,           // Not accessible via JavaScript
  secure: true,             // HTTPS only (production)
  sameSite: "lax",          // CSRF protection
  path: "/"                 // Available on all paths
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTHENTICATION_ERROR` | 401 | Missing/invalid/expired token |
| `AUTHORIZATION_ERROR` | 403 | Valid token but not authorized for resource |

## Flow Diagram

```
User                PWA                 API                 Google
 |                   |                   |                    |
 | Click Login       |                   |                    |
 |------------------>|                   |                    |
 |                   | GET /auth/google  |                    |
 |                   |------------------>|                    |
 |                   |   302 Redirect    |                    |
 |                   |<------------------|                    |
 |     Redirect to Google consent screen                      |
 |<---------------------------------------------------------->|
 |                   |                   |                    |
 |                   | Callback w/ code  |                    |
 |                   |------------------>|                    |
 |                   |                   | Exchange code      |
 |                   |                   |------------------->|
 |                   |                   | User info          |
 |                   |                   |<-------------------|
 |                   | Set cookies       |                    |
 |                   |<------------------|                    |
 | Redirect to app   |                   |                    |
 |<------------------|                   |                    |
```
